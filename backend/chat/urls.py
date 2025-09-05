# chat/urls.py
from django.urls import path
from .views import ConversationDetailView, MessageListCreateView

urlpatterns = [
    path("orders/<int:order_id>/conversation/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("orders/<int:order_id>/messages/", MessageListCreateView.as_view(), name="message-list-create"),
]
