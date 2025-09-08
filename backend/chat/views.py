from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
import os
import requests
import json
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from orders.models import Order
from .chatbot_flow import chatbot_flows


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        if not (self.request.user == order.client or
                self.request.user == order.worker or
                self.request.user.is_staff):
            return Response({'error': 'You do not have permission'}, status=status.HTTP_403_FORBIDDEN)
        conversation, _ = Conversation.objects.get_or_create(order=order)
        return conversation


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        if not (self.request.user == order.client or
                self.request.user == order.worker or
                self.request.user.is_staff):
            return Message.objects.none()
        conversation, _ = Conversation.objects.get_or_create(order=order)
        return Message.objects.filter(conversation=conversation).order_by('timestamp')

    def perform_create(self, serializer):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        if not (self.request.user == order.client or
                self.request.user == order.worker or
                self.request.user.is_staff):
            return Response({'error': 'You do not have permission'}, status=status.HTTP_403_FORBIDDEN)
        conversation, _ = Conversation.objects.get_or_create(order=order)
        serializer.save(conversation=conversation, sender=self.request.user)


class ChatbotRespondView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_message = (request.data.get("message") or "").strip()
        lang = (request.data.get("lang") or "").strip().lower() or None
        current_state = request.data.get("current_state", "start")

        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Use the flow-based chatbot system
        reply, next_state = self._process_flow_message(user_message, current_state, lang)

        return Response({
            "reply": reply,
            "next_state": next_state
        }, status=status.HTTP_200_OK)

    def _process_flow_message(self, user_message: str, current_state: str, lang: str | None = None) -> tuple[str, str]:
        """Process user message through the chatbot flow system"""
        try:
            user_message_lower = user_message.lower().strip()
            lang = lang or 'ar'

            # Get current flow state
            current_flow = chatbot_flows.get(current_state, chatbot_flows["start"])

            # Check if user wants to start over
            if any(word in user_message_lower for word in ['مرحبا', 'start', 'بداية', 'جديد', 'أهلا', 'هلا', 'hello']):
                start_message = chatbot_flows["start"]["message"]
                if isinstance(start_message, dict):
                    start_message = start_message.get(lang, start_message['ar'])
                return start_message, "start"

            # Check for matches in options
            if current_flow.get("options"):
                for option_key, option_next_state in current_flow["options"].items():
                    if (option_key.lower() == user_message_lower or 
                        option_key.lower() in user_message_lower or 
                        user_message_lower in option_key.lower()):
                        
                        next_flow = chatbot_flows.get(option_next_state, chatbot_flows["start"])
                        reply_message = next_flow["message"]
                        if isinstance(reply_message, dict):
                            reply_message = reply_message.get(lang, reply_message['ar'])
                        return reply_message, option_next_state

            # If no match found
            if lang == 'en':
                return "Sorry, I didn't understand that. Please choose from the available options or type 'back' to return.", current_state
            else:
                return "عذراً، لم أفهم ذلك. يرجى الاختيار من الخيارات المتاحة أو اكتب 'عودة' للرجوع.", current_state
                
        except Exception as e:
            print(f"Error in _process_flow_message: {e}")
            if lang == 'en':
                return "Sorry, there was an error processing your request. Please try again.", "start"
            else:
                return "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.", "start"

    def _normalize_lang(self, user_message: str, lang: str | None) -> str:
        if lang in ("ar", "en"):
            return lang
        has_arabic = any('\u0600' <= ch <= '\u06FF' for ch in user_message)
        return 'ar' if has_arabic else 'en'

    def _get_ollama_response(self, user_message: str, lang: str | None = None) -> str | None:
        """Query a local Ollama model if available (completely free, no keys)."""
        lang = self._normalize_lang(user_message, lang)
        system_prompt = (
            "You are a helpful assistant for the Khadamatak platform. "
            "Always reply strictly in this language code: " + lang + ". "
            "If 'ar' then reply in Arabic; if 'en' then reply in English."
        )
        # Common small model that runs locally. Users can pull: `ollama pull llama3.1:8b`
        model_name = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
        url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434") + "/api/chat"

        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "stream": False
        }
        try:
            resp = requests.post(url, json=payload, timeout=20)
            resp.raise_for_status()
            data = resp.json()
            content = data.get("message", {}).get("content") or ""
            return content.strip() or None
        except Exception as e:
            # If Ollama service isn't running, just return None to try next strategy
            print(f"Ollama not available: {e}")
            return None

    def _get_huggingface_response(self, user_message: str, lang: str | None = None) -> str:
        """Get response from Hugging Face's free Inference API"""
        # Detect language if not provided
        if lang not in ("ar", "en"):
            has_arabic = any('\u0600' <= ch <= '\u06FF' for ch in user_message)
            lang = 'ar' if has_arabic else 'en'

        # Create a context-aware prompt
        if lang == 'ar':
            system_context = "أنت مساعد ذكي لمنصة خدماتك. أنت مفيد ومهذب وتجيب باللغة العربية. تساعد المستخدمين في البحث عن الخدمات، إنشاء الطلبات، تتبع الطلبات، والفواتير."
            prompt = f"{system_context}\n\nالمستخدم: {user_message}\nالمساعد:"
        else:
            system_context = "You are a helpful assistant for the Khadamatak platform. You are friendly, polite, and respond in English. You help users with finding services, creating orders, tracking orders, and invoices."
            prompt = f"{system_context}\n\nUser: {user_message}\nAssistant:"

        # Use Hugging Face's free Inference API with a better model
        API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"
        headers = {"Authorization": "Bearer hf_free"}  # Free tier doesn't require auth

        payload = {
            "inputs": prompt,
            "parameters": {
                "max_length": 150,
                "temperature": 0.8,
                "do_sample": True,
                "top_p": 0.9,
                "repetition_penalty": 1.1
            }
        }

        try:
            response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
            response.raise_for_status()

            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get('generated_text', '')
                if 'Assistant:' in generated_text:
                    reply = generated_text.split('Assistant:')[-1].strip()
                else:
                    reply = generated_text.replace(prompt, '').strip()

                if reply:
                    return reply
        except Exception as e:
            print(f"Hugging Face API call failed: {e}")

        # Fallback to intelligent response
        return self._intelligent_fallback(user_message, lang)

    def _intelligent_fallback(self, text: str, lang: str | None = None) -> str:
        """Generate intelligent responses based on keywords and context"""
        if lang not in ("ar", "en"):
            has_arabic = any('\u0600' <= ch <= '\u06FF' for ch in text)
            lang = 'ar' if has_arabic else 'en'

        text_lower = text.lower()

        if lang == 'ar':
            # Arabic responses
            if any(word in text_lower for word in ['مرحبا', 'السلام', 'أهلا', 'هلا', 'ازيك', 'إزيك', 'إزيكك', 'ازيكك']):
                return "أهلاً وسهلاً! أنا بخير والحمد لله 😊\nإزيك إنت؟ إيه اللي ممكن أساعدك فيه النهاردة؟"
            elif any(word in text_lower for word in ['كيف', 'إزيك', 'ازيك', 'أخبارك', 'أخبار إيه']):
                return "أنا بخير والحمد لله! شكراً لسؤالك 😊\nإزيك إنت؟ إيه اللي محتاج مساعدة فيه؟"
            elif any(word in text_lower for word in ['شكرا', 'شكراً', 'متشكر', 'تسلم', 'الله يخليك']):
                return "العفو! دي واجبي 😊\nإيه تاني اللي ممكن أساعدك فيه؟"
            elif any(word in text_lower for word in ['خدمة', 'خدمات', 'service']):
                return "ممتاز! عندنا خدمات كتير ممكن تفيدك 🔧\nمثل: السباكة، الكهرباء، النظافة، التكييف، والكثير تاني\nإيه نوع الخدمة اللي محتاجها؟"
            elif any(word in text_lower for word in ['طلب', 'حجز', 'book', 'order']):
                return "ماشي! هساعدك تعمل طلب جديد 📝\nقولي:\n- إيه نوع الخدمة؟\n- فين موقعك؟\n- إمتى مناسب ليك؟\nوهكمل معاك باقي الخطوات"
            elif any(word in text_lower for word in ['تتبع', 'متابعة', 'track', 'status']):
                return "طبعاً! هساعدك تتتبع طلباتك 📍\nاديني رقم الطلب أو قولي التفاصيل وهقولك إيه آخر حاجة حصلت"
            elif any(word in text_lower for word in ['فاتورة', 'دفع', 'invoice', 'payment']):
                return "ماشي! هساعدك في الفواتير والدفع 💳\nاديني رقم الطلب وهوريك تفاصيل الفاتورة وطرق الدفع المتاحة"
            elif any(word in text_lower for word in ['مش عارف', 'مش فاهم', 'مش عارفة', 'مش فاهمة']):
                return "مش مشكلة خالص! أنا هنا عشان أساعدك 😊\nقولي إيه اللي مش واضح ليك وهوضحهولك"
            elif any(word in text_lower for word in ['باي', 'وداع', 'مع السلامة', 'سلام']):
                return "مع السلامة! 😊\nأي وقت تحتاج مساعدة، أنا موجود هنا"
            # Sports and general questions
            elif any(word in text_lower for word in ['الأهلي', 'الزمالك', 'أهلي', 'زمالك', 'كورة', 'كرة', 'فريق', 'أقوى', 'مين']):
                return "هههه، سؤال حلو! 😄\nالأهلي والزمالك الاتنين فرق عظيمة في مصر! كل واحد له جماهير كتير ومشجعين مخلصين.\nبس أنا هنا عشان أساعدك في خدماتك - إيه نوع الخدمة اللي محتاجها؟ 🔧"
            elif any(word in text_lower for word in ['إيه', 'إيه ده', 'إيه كده', 'إيه رأيك', 'إيه رأيك في']):
                return "سؤال حلو! 😊\nبس أنا متخصص في مساعدتك في خدماتك - السباكة، الكهرباء، النظافة، والتكييف.\nإيه نوع الخدمة اللي محتاجها؟"
            elif any(word in text_lower for word in ['متى', 'إمتى', 'وقت', 'متى هيكون']):
                return "ممتاز! أنا هنا عشان أساعدك في تحديد المواعيد المناسبة للخدمات 📅\nإيه نوع الخدمة اللي عايز تحجزها؟"
            elif any(word in text_lower for word in ['كم', 'كام', 'سعر', 'تكلفة', 'فلوس', 'مصاريف']):
                return "ممتاز! أنا هساعدك تعرف أسعار الخدمات 💰\nإيه نوع الخدمة اللي عايز تعرف سعرها؟"
            elif any(word in text_lower for word in ['وين', 'فين', 'مكان', 'موقع', 'عنوان']):
                return "ماشي! أنا هساعدك في المواقع والعناوين 📍\nإيه نوع الخدمة اللي محتاجها؟"
            elif any(word in text_lower for word in ['مشكلة', 'مشاكل', 'عطل', 'عطلان', 'مكسور']):
                return "مش مشكلة! أنا هنا عشان أساعدك تحل أي مشكلة 🔧\nإيه نوع العطل أو المشكلة اللي عندك؟"
            elif any(word in text_lower for word in ['محتاج', 'عايز', 'أريد', 'أحتاج', 'محتاجة']):
                return "ممتاز! أنا هنا عشان أساعدك في أي حاجة محتاجها 😊\nقولي إيه اللي محتاجه بالضبط؟"
            else:
                return f"سؤال حلو! 😊\n{text}\n\nبس أنا متخصص في مساعدتك في خدماتك - السباكة، الكهرباء، النظافة، التكييف، وغيرها.\nإيه نوع الخدمة اللي محتاجها؟ أو إيه اللي ممكن أساعدك فيه؟"

        else:
            # English responses
            if any(word in text_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'how are you']):
                return "Hello! I'm doing great, thank you! 😊\nHow are you? What can I help you with today?"
            elif any(word in text_lower for word in ['how are you', 'how do you do', 'what\'s up']):
                return "I'm doing well, thanks for asking! 😊\nHow about you? What do you need help with?"
            elif any(word in text_lower for word in ['thank you', 'thanks', 'appreciate']):
                return "You're welcome! That's what I'm here for 😊\nIs there anything else I can help you with?"
            elif any(word in text_lower for word in ['service', 'services']):
                return "Great! We have many services that can help you 🔧\nLike: plumbing, electrical, cleaning, AC repair, and much more\nWhat type of service do you need?"
            elif any(word in text_lower for word in ['order', 'book', 'request']):
                return "Perfect! I'll help you create a new order 📝\nTell me:\n- What type of service?\n- Where's your location?\n- When is convenient for you?\nAnd I'll help you complete the process"
            elif any(word in text_lower for word in ['track', 'status', 'follow']):
                return "Of course! I'll help you track your orders 📍\nGive me your order number or tell me the details and I'll give you the latest updates"
            elif any(word in text_lower for word in ['invoice', 'payment', 'bill']):
                return "Sure! I'll help you with invoices and payments 💳\nGive me your order number and I'll show you the invoice details and available payment methods"
            elif any(word in text_lower for word in ['don\'t know', 'confused', 'not sure']):
                return "No problem at all! I'm here to help you 😊\nTell me what's not clear and I'll explain it to you"
            elif any(word in text_lower for word in ['bye', 'goodbye', 'see you', 'farewell']):
                return "Goodbye! 😊\nAnytime you need help, I'm here for you"
            else:
                return f"Interesting question! 😊\n{text}\n\nBut I'm specialized in helping you with our services - plumbing, electrical, cleaning, AC repair, and more.\nWhat type of service do you need? Or how can I assist you?"

    def _fallback_reply(self, text: str, lang: str | None = None) -> str:
        """Return a friendly local reply when AI is unavailable"""
        return self._intelligent_fallback(text, lang)