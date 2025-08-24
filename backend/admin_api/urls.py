from django.urls import path
from .views import (
    admin_users,
    admin_user_detail,
    admin_services,
    admin_orders,
    admin_reviews,
    admin_ratings,
    admin_stats
)

urlpatterns = [
    path('stats/', admin_stats, name='admin-stats'),
    path('users/', admin_users, name='admin-users-list'),
    path('users/<int:pk>/', admin_user_detail, name='admin-users-detail'),
    path('services/', admin_services, name='admin-services-list'),
    path('orders/', admin_orders, name='admin-orders-list'),
    path('reviews/', admin_reviews, name='admin-reviews-list'),
    path('ratings/', admin_ratings, name='admin-ratings-list'),
    
]
