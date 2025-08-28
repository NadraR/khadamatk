from django.urls import path
from .views import *

urlpatterns = [
    path('stats/', admin_stats, name='admin-stats'),

    # Users
    path('users/', admin_users, name='admin-users-list'),
    path('users/<int:pk>/', admin_user_detail, name='admin-users-detail'),

    # Services
    path('services/', admin_services, name='admin-services-list'),
    path('services/<int:pk>/', admin_service_detail, name='admin-service-detail'),

    # Orders
    path('orders/', admin_orders, name='admin-orders-list'),
    path('orders/<int:pk>/', admin_order_detail, name='admin-order-detail'),

    # Reviews
    path('reviews/', admin_reviews, name='admin-reviews-list'),
    path('reviews/<int:pk>/', admin_review_detail, name='admin-review-detail'),

    # Ratings
    path('ratings/', admin_ratings, name='admin-ratings-list'),
    path('ratings/<int:pk>/', admin_rating_detail, name='admin-rating-detail'),

    # Invoices
    path('invoices/', admin_invoices, name='admin-invoices-list'),
    path('invoices/<int:pk>/', admin_invoice_detail, name='admin-invoice-detail'),

    path("me/",AdminMeView.as_view(), name="admin-me"),
    path("logs/", admin_logs_view),

]
