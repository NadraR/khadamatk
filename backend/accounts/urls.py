from django.urls import path
from .views import UserRegisterView, WorkerProfileCreateView, ClientProfileCreateView

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='register'),
    path('worker/profile/', WorkerProfileCreateView.as_view(), name='worker-profile'),
    path('client/profile/', ClientProfileCreateView.as_view(), name='client-profile'),
]

