from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied,NotFound
from django.conf import settings
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .models import User, WorkerProfile, ClientProfile
from .serializers import CustomUserCreateSerializer, WorkerProfileSerializer, ClientProfileSerializer, UserSerializer, LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model

from .models import User, WorkerProfile, ClientProfile
from .serializers import (
    CustomUserCreateSerializer,
    WorkerProfileSerializer,
    ClientProfileSerializer,
)

from google.oauth2 import id_token
from google.auth.transport import requests

User = get_user_model()

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer




# Helper function: generate tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

# ------------------------
# Register (Email/Password)
# ------------------------
class UserRegisterView(generics.CreateAPIView):
    serializer_class = CustomUserCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_data = serializer.validated_data
        user_data["auth_provider"] = "email"
        user = User.objects.create_user(**user_data)
        return Response({
            "message": "User registered successfully",
            "email": user.email,
            "role": user.role,
            "auth_provider": user.auth_provider,
            "tokens": get_tokens_for_user(user),
        }, status=status.HTTP_201_CREATED)

# ------------------------
# Google Login / Register
# ------------------------
class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # تحسين استقبال التوكن: أي حقل من الأربعة مقبول
        token = (
            request.data.get("token") or 
            request.data.get("id_token") or 
            request.data.get("credential") or
            request.data.get("access_token")
        )
        role = request.data.get("role")

        # طباعة البيانات اللي جاية من الـ frontend للتصحيح
        print("=== Google Login Debug ===")
        print("Received Token (first 50 chars):", str(token)[:50] if token else None)
        print("Received Role:", role)
        print("Full request data:", request.data)

        if not token:
            return Response({"error": "Missing Google ID token."}, status=400)
        if role not in ["worker", "client"]:
            return Response({"error": 'Role must be "worker" or "client".'}, status=400)

        try:
            # محاولة تحقق التوكن من جوجل
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
            )
            print("Google Payload:", idinfo)

            if not idinfo.get("email_verified"):
                return Response({"error": "Email not verified by Google."}, status=400)

            email = idinfo.get("email")
            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")

            # تنظيف أي مستخدمين لديهم phone فارغ مسبقاً
            User.objects.filter(phone="").update(phone=None)

            # إنشاء المستخدم أو استرجاعه
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0],
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_active": True,
                    "role": role,
                    "auth_provider": "google",
                    "password": make_password("unused-google-user"),
                    "phone": None,  # استخدم None بدلاً من string فارغ
                },
            )

            # إذا كان المستخدم موجود مسبقاً ولديه phone فارغ، قم بتحديثه
            if not created and user.phone == "":
                user.phone = None
                user.save(update_fields=["phone"])

            # تحديث auth_provider إذا كان مستخدم موجود
            if not created:
                if user.role != role:
                    return Response(
                        {"error": f'User already exists as "{user.role}".'}, status=400
                    )
                if user.auth_provider != "google":
                    user.auth_provider = "google"
                    user.save(update_fields=["auth_provider"])

            return Response({
                "success": True,
                "email": user.email,
                "role": user.role,
                "auth_provider": user.auth_provider,
                "tokens": get_tokens_for_user(user),
            }, status=200)

        except ValueError as e:
            print("Google Token Verification Error:", str(e))
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            print("Unexpected Google Login Error:", str(e))
            return Response({"error": str(e)}, status=400)
# ------------------------
# Worker Profile
# ------------------------
class WorkerProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if self.request.user.role != "worker":
            raise PermissionDenied("Only workers can update worker profiles.")
        profile, _ = WorkerProfile.objects.get_or_create(user=self.request.user)
        return profile

# ------------------------
# Client Profile
# ------------------------
class ClientProfileUpdateView(generics.RetrieveUpdateAPIView):
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
