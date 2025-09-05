from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings
import openai
import os
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from orders.models import Order

class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        
        # Check if user can access this order
        if not (self.request.user == order.client or 
                self.request.user == order.worker or 
                self.request.user.is_staff):
            return Response(
                {'error': 'You do not have permission to access this conversation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        conversation, created = Conversation.objects.get_or_create(order=order)
        return conversation


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        
        # Check if user can access this order
        if not (self.request.user == order.client or 
                self.request.user == order.worker or 
                self.request.user.is_staff):
            return Message.objects.none()
        
        conversation, _ = Conversation.objects.get_or_create(order=order)
        return Message.objects.filter(conversation=conversation).order_by('timestamp')

    def perform_create(self, serializer):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        
        # Check if user can access this order
        if not (self.request.user == order.client or 
                self.request.user == order.worker or 
                self.request.user.is_staff):
            return Response(
                {'error': 'You do not have permission to send messages to this conversation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        conversation, _ = Conversation.objects.get_or_create(order=order)
        serializer.save(conversation=conversation, sender=self.request.user)


class ChatbotRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_message = (request.data.get("message") or "").strip()
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Initialize OpenAI client
            openai.api_key = os.getenv('OPENAI_API_KEY')
            if not openai.api_key:
                # Fallback to simple responses if no API key
                return self._get_fallback_response(user_message)

            # Create a context-aware prompt
            system_prompt = """You are a helpful assistant for a service marketplace platform called "Khadamatak" (Arabic for "Your Services"). 
            
            The platform connects clients with service providers for various services like:
            - Home services (cleaning, plumbing, electrical, carpentry, painting)
            - Maintenance and repairs
            - Professional services
            
            Key features of the platform:
            - Users can browse services by category and location
            - Clients can place orders and track them
            - Service providers can offer their services
            - There's a rating and review system
            - Invoicing and payment system
            
            Respond helpfully to user questions about:
            - How to use the platform
            - Finding services
            - Placing orders
            - Managing invoices
            - General questions about home services
            - Any other questions they might have
            
            Be friendly, helpful, and informative. If you don't know something specific about the platform, say so but offer general helpful advice."""

            # Get AI response
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=300,
                temperature=0.7
            )
            
            reply = response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Fallback to simple responses if API fails
            reply = self._get_fallback_response(user_message)

        return Response({"reply": reply}, status=status.HTTP_200_OK)
    
    def _get_fallback_response(self, user_message):
        """Fallback responses when OpenAI API is not available"""
        lower_text = user_message.lower()
        if any(keyword in lower_text for keyword in ["hello", "hi", "hey", "مرحبا", "السلام"]):
            return "Hello! I'm here to help you with Khadamatak services. How can I assist you today?"
        elif "order" in lower_text or "طلب" in lower_text:
            return "You can view and manage your orders in the Orders section. Would you like help with placing a new order or tracking an existing one?"
        elif "invoice" in lower_text or "payment" in lower_text or "فاتورة" in lower_text:
            return "Invoices and payments are managed in the Invoices section. I can help explain invoice statuses or payment methods."
        elif "service" in lower_text or "خدمة" in lower_text:
            return "Browse our services by category (cleaning, plumbing, electrical, etc.) in the Services section. What type of service do you need?"
        elif "help" in lower_text or "مساعدة" in lower_text:
            return "I'm here to help! You can ask me about services, orders, invoices, or how to use the platform. What would you like to know?"
        else:
            return "I understand you're asking about: '" + user_message + "'. I'm here to help with Khadamatak services, orders, and invoices. Could you be more specific about what you need help with?"
