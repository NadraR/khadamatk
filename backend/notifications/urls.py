from django.urls import path
from .views import NotificationListView, unread_count, mark_read, mark_all_read

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications-list'),
    path('unread-count/', unread_count, name='notifications-unread-count'),
    path('<int:pk>/mark-read/', mark_read, name='notifications-mark-read'),
    path('mark-all-read/', mark_all_read, name='notifications-mark-all-read'),
]
