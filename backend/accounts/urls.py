from django.urls import path
from .views import UserRegisterView, WorkerProfileCreateView, ClientProfileView, UserListView, ClientProfileCreateView, LoginView, get_user_by_id,delete_client_profile
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='register'),
    # accounts/urls.py
    path('login/', LoginView.as_view(), name='login'),
    
    path('worker/profile/', WorkerProfileCreateView.as_view(), name='worker-profile'),
    path('client/profile/', ClientProfileView.as_view(), name='client-profile'),
    path('client/profile/create/', ClientProfileCreateView.as_view(), name='client-profile-create'),
    # path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path('users/', UserListView.as_view(), name='users-list'),
    path('client/<int:user_id>/',get_user_by_id, name='client-profile-by-id'),
    path('client/<int:user_id>/delete/', delete_client_profile, name='client-profile-delete'),



]

