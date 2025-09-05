from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
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
