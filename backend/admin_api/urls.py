# backend/admin_api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ServiceViewSet, OrderViewSet, ReviewViewSet, RatingViewSet,
    InvoiceViewSet, AdminActionLogViewSet, AdminNotificationViewSet,
    AdminStatsView, AdminMeView, CategoryViewSet, FinancialReportView,
    PlatformSettingViewSet, AdminLoginView, AdminRegisterView
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("services", ServiceViewSet, basename="services")
router.register("categories", CategoryViewSet, basename="categories")
router.register("orders", OrderViewSet, basename="orders")
router.register("reviews", ReviewViewSet, basename="reviews")
router.register("ratings", RatingViewSet, basename="ratings")
router.register("invoices", InvoiceViewSet, basename="invoices")
router.register("logs", AdminActionLogViewSet, basename="logs")
router.register("notifications", AdminNotificationViewSet, basename="notifications")
router.register("settings", PlatformSettingViewSet, basename="settings")

urlpatterns = [
    path("login/", AdminLoginView.as_view(), name="admin-login"),
    path("register/", AdminRegisterView.as_view(), name="admin-register"),
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("financial-report/", FinancialReportView.as_view(), name="financial-report"),
    path("me/", AdminMeView.as_view(), name="admin-me"),
    path("", include(router.urls)),
]