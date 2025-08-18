from django.urls import path
from .views import (
    AdminUserListView, AdminUserDetailView,
    AdminServiceListView, AdminServiceDetailView,
    AdminOrderListView, AdminOrderDetailView,
    AdminReviewListView, AdminReviewDetailView,
    AdminRatingListView, AdminRatingDetailView,
    AdminStatsView
)

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-users-detail'),
    path('services/', AdminServiceListView.as_view(), name='admin-services-list'),
    path('services/<int:pk>/', AdminServiceDetailView.as_view(), name='admin-services-detail'),
    path('orders/', AdminOrderListView.as_view(), name='admin-orders-list'),
    path('orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-orders-detail'),
    path('reviews/', AdminReviewListView.as_view(), name='admin-reviews-list'),
    path('reviews/<int:pk>/', AdminReviewDetailView.as_view(), name='admin-reviews-detail'),
    path('ratings/', AdminRatingListView.as_view(), name='admin-ratings-list'),
    path('ratings/<int:pk>/', AdminRatingDetailView.as_view(), name='admin-ratings-detail'),
]
