from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserLocationViewSet

router = DefaultRouter()
router.register(r'locations', UserLocationViewSet, basename='userlocation')

urlpatterns = [
    path('', include(router.urls)),
]