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
from django.contrib.auth import get_user_model
User = get_user_model()

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
        token = request.data.get('token')
        
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # تحقق من صحة الـ token
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_OAUTH_CLIENT_ID
            )
            
            # استخراج البيانات
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            # البحث عن user موجود أو إنشاء جديد
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # إنشاء user جديد
                user = User.objects.create(
                    email=email,
                    username=email,  # استخدام email كـ username
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True
                )
                # يمكنك إضافة role حسب احتياجك
                user.set_unusable_password()  # لأن التسجيل عبر Google
                user.save()
            
            # إنشاء JWT tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            
            return Response({
                'refresh': str(refresh),
                'access': str(access),
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'role': getattr(user, 'role', None),
                'first_name': user.first_name,
                'last_name': user.last_name,
            }, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)