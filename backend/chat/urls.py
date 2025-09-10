# chat/urls.py
from django.urls import path
from .views import (
    ConversationDetailView, 
    MessageListCreateView, 
    UserConversationsView,
    get_unread_message_count,
    get_recent_messages,
    mark_messages_as_read,
    mark_all_messages_as_read
)

urlpatterns = [
    # Order-specific chat endpoints
    path("orders/<int:order_id>/conversation/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("orders/<int:order_id>/messages/", MessageListCreateView.as_view(), name="message-list-create"),
    
    # User chat endpoints
    path("conversations/", UserConversationsView.as_view(), name="user-conversations"),
    path("messages/unread-count/", get_unread_message_count, name="unread-message-count"),
    path("messages/recent/", get_recent_messages, name="recent-messages"),
    path("messages/mark-read/", mark_messages_as_read, name="mark-messages-read"),
    path("messages/mark-all-read/", mark_all_messages_as_read, name="mark-all-messages-read"),
]
