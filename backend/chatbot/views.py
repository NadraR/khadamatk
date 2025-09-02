from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import ChatMessage
from .serializers import ChatMessageSerializer
import uuid
from django.conf import settings

# simple rules
FAQ = {
    "مرحبا": "أهلا! كيف أقدر أساعدك؟",
    "كيف أطلب": "من صفحة الخدمات اضغط 'احجز' أو 'قدم عرض' على الخدمة المطلوبة.",
    "الاسعار": "الأسعار بتظهر بجانب كل خدمة — لو محتاج سعر تقريبي ابعت اسم الخدمة.",
    "الدفع": "ندعم الدفع عند الطلب وفيزا/تحويل بنكي \n اقرأ تفاصيل الدفع في صفحة الفواتير."
}

class ChatbotAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        session_id = request.data.get('session_id') or str(uuid.uuid4())
        text = (request.data.get('message') or '').strip()
        if not text:
            return Response({'error': 'message required'}, status=status.HTTP_400_BAD_REQUEST)

        # save user message
        user_msg = ChatMessage.objects.create(session_id=session_id, sender='user', message=text)

        reply = None

        # simple rule matching (exact or keyword)
        lower = text.lower()
        for k, v in FAQ.items():
            if k in lower or k == text:
                reply = v
                break

        # optional: call OpenAI if configured and no rule matched
        if not reply and getattr(settings, 'OPENAI_API_KEY', None):
            try:
                import openai
                openai.api_key = settings.OPENAI_API_KEY
                resp = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role":"user","content": text}],
                    max_tokens=200
                )
                reply = resp.choices[0].message.content.strip()
            except Exception as e:
                reply = "عذرًا حصل خطأ أثناء محاولة الإجابة. يرجى المحاولة لاحقًا."

        if not reply:
            reply = "آسف، لم أتمكن من فهم سؤالك. جرب تسأل بصيغة أبسط أو اطّلع على قسم الأسئلة الشائعة."

        bot_msg = ChatMessage.objects.create(session_id=session_id, sender='bot', message=reply)
        return Response({
            'session_id': session_id,
            'reply': reply,
            'messages': ChatMessageSerializer([user_msg, bot_msg], many=True).data
        })
