from django.urls import path
from .views import (
    UserRegisterView,
    GoogleLoginView,
    WorkerProfileUpdateView,
    ClientProfileUpdateView,
    LogoutView,
)

urlpatterns = [
   path("register/", UserRegisterView.as_view(), name="register"),
    path("google-login/", GoogleLoginView.as_view(), name="google-login"),
    path("worker/profile/", WorkerProfileUpdateView.as_view(), name="worker-profile"),
    path("client/profile/", ClientProfileUpdateView.as_view(), name="client-profile"),
    path("logout/", LogoutView.as_view(), name="logout"),
]

