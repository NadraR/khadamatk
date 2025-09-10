from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    LoginView,
    LogoutView,
    UserRegisterView,
    WorkerProfileCreateView,
    ClientProfileView,
    ClientProfileCreateView,
    get_user_by_id,
    delete_client_profile,
    UserListView,
    GoogleLoginView,
    ProviderPublicProfileView
    )

urlpatterns = [
    path("login/", LoginView.as_view(), name="custom_login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("register/", UserRegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('worker/profile/', WorkerProfileCreateView.as_view(), name='worker-profile'),
    path('client/profile/', ClientProfileView.as_view(), name='client-profile'),
    path('client/profile/create/', ClientProfileCreateView.as_view(), name='client-profile-create'),
    path('client/<int:user_id>/', get_user_by_id, name='client-profile-by-id'),
    path('client/<int:user_id>/delete/', delete_client_profile, name='client-profile-delete'),
    path('users/', UserListView.as_view(), name='users-list'),
    path('provider/<int:pk>/', ProviderPublicProfileView.as_view(), name='provider-public-profile'),
    #Google OAuth2 login
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
]