from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.conf import settings
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from google.oauth2 import id_token
from google.auth.transport import requests

from .models import User, WorkerProfile, ClientProfile
from .serializers import (
    CustomUserCreateSerializer,
    WorkerProfileSerializer,
    ClientProfileSerializer,
)

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

    def get_object(self):
        if self.request.user.role != "client":
            raise PermissionDenied("Only clients can update client profiles.")
        profile, _ = ClientProfile.objects.get_or_create(user=self.request.user)
        return profile

# ------------------------
# Logout (Blacklist Refresh Token)
# ------------------------
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