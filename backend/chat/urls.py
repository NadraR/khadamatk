from django.urls import path
from .views import ConversationDetailView, MessageListCreateView, ChatbotRespondView

urlpatterns = [
    path('conversation/<int:order_id>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversation/<int:order_id>/messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('bot/respond/', ChatbotRespondView.as_view(), name='chatbot-respond'),
]
