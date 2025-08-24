from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   
    TokenRefreshView,     
)

from .views import (
    UserRegisterView,
    GoogleLoginView,
    WorkerProfileUpdateView,
    ClientProfileUpdateView,
    LogoutView,
    LoginView,
    WorkerProfileCreateView,
    ClientProfileCreateView,
    ClientProfileView,
    UserListView,
    get_user_by_id,
    delete_client_profile

)

urlpatterns = [
   path("register/", UserRegisterView.as_view(), name="register"),
    path("google-login/", GoogleLoginView.as_view(), name="google-login"),
    path("worker/profile/", WorkerProfileUpdateView.as_view(), name="worker-profile"),
    path("client/profile/", ClientProfileUpdateView.as_view(), name="client-profile"),
    path("logout/", LogoutView.as_view(), name="logout"),
]


urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='user-login'),

    path('worker/profile/', WorkerProfileCreateView.as_view(), name='worker-profile'),

    path('client/profile/', ClientProfileView.as_view(), name='client-profile-detail'),  
    path('client/profile/create/', ClientProfileCreateView.as_view(), name='client-profile-create'),

    path('users/', UserListView.as_view(), name='users-list'),
    path('client/<int:user_id>/', get_user_by_id, name='client-profile-by-id'),
    path('client/<int:user_id>/delete/', delete_client_profile, name='client-profile-delete'),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]
