from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('unread-count/', views.unread_count, name='unread-count'),
    path('stats/', views.notification_stats, name='notification-stats'),
    path('<int:pk>/mark-read/', views.mark_read, name='mark-read'),
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
    path('<int:notification_id>/action/', views.notification_action, name='notification-action'),
]