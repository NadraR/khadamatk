from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from .models import User, WorkerProfile, ClientProfile
from .serializers import CustomUserCreateSerializer, WorkerProfileSerializer, ClientProfileSerializer, UserSerializer, LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.views import APIView
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests
from allauth.socialaccount.models import SocialAccount
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests
from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
import requests as http
from google.auth.transport import requests as google_requests
import logging

User = get_user_model()
logger = logging.getLogger(__name__)
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserRegisterView(generics.CreateAPIView):
    serializer_class = CustomUserCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Automatically create the profile based on the role
        response_data = serializer.data
        response_data['message'] = 'User registered successfully'
        
        # Automatically log in the user and return tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        response_data.update({
            'refresh': str(refresh),
            'access': str(access),
            'user_id': user.id,
        })
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class WorkerProfileCreateView(generics.CreateAPIView):
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'worker':
            raise PermissionError("Only workers can create a worker profile.")
        serializer.save(user=self.request.user)


class ClientProfileCreateView(generics.CreateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'client':
            raise PermissionError("Only clients can create a client profile.")
        serializer.save(user=self.request.user) 

class ClientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return ClientProfile.objects.get(user=self.request.user)
        except ClientProfile.DoesNotExist:
            raise NotFound("Client profile does not exist. Please create it first.")

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])  # أو AllowAny حسب حاجتك
def get_user_by_id(request, user_id):
    """
    Retrieve user data by ID
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])  # غيريها لو مش عايزة authentication
def delete_client_profile(request, user_id):
    """
    Function-based view to delete a ClientProfile by user ID.
    """
    try:
        profile = ClientProfile.objects.get(user__id=user_id)  # <-- نستخدم user__id هنا
    except ClientProfile.DoesNotExist:
        return Response({"detail": "Client profile does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    profile.delete()
    return Response({"detail": "Client profile deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # إنشاء الـ tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response({
            'refresh': str(refresh),
            'access': str(access),
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': getattr(user, 'role', None),
        }, status=status.HTTP_200_OK)
    
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"error": "Invalid or expired token."},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({"success": "Logged out successfully."},
                        status=status.HTTP_205_RESET_CONTENT)
    
class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.info(f"[GoogleLogin DEBUG] Incoming request data: {request.data}")

        token = request.data.get("token")
        role = request.data.get("role")

        if not token:
            logger.error("[GoogleLogin DEBUG] Missing Google ID token in request")
            return Response({'error': 'Missing Google ID token'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # ✅ Step 1: Verify the ID Token
            logger.info("[GoogleLogin DEBUG] Verifying ID token...")
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            logger.info(f"[GoogleLogin DEBUG] Verified idinfo: {idinfo}")

            email = idinfo.get("email")
            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")

            if not email:
                logger.error("[GoogleLogin DEBUG] No email found in ID Token")
                return Response({"error": "Invalid ID token: missing email"}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Step 2: Get or create the user
            logger.info(f"[GoogleLogin DEBUG] Looking up user by email: {email}")
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_active": True,
                }
            )

            if created:
                logger.info(f"[GoogleLogin DEBUG] New user created: {email}")
                user.set_unusable_password()
                user.save()

            # ✅ Step 3: Check and set role
            logger.info(f"[GoogleLogin DEBUG] Checking role for user {email}: role param={role}")
            if created or not getattr(user, "role", None):
                if role in ["client", "worker"]:
                    user.role = role
                    user.save()
                    logger.info(f"[GoogleLogin DEBUG] Role set for {email}: {role}")
                else:
                    logger.warning(f"[GoogleLogin DEBUG] Role missing or invalid for {email}")
                    return Response({
                        "needs_role": True,
                        "message": "Select your role to complete registration",
                        "email": email,
                        "is_new_user": created,
                    }, status=status.HTTP_200_OK)

            # ✅ Step 4: Generate JWT tokens
            logger.info(f"[GoogleLogin DEBUG] Generating JWT for {email}")
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            logger.info(f"[GoogleLogin DEBUG] Login successful for {email}")
            return Response({
                "refresh": str(refresh),
                "access": str(access),
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": getattr(user, "role", None),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_new_user": created,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("[GoogleLogin DEBUG] Unexpected error during Google login")
            return Response({"error": f"Authentication failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)