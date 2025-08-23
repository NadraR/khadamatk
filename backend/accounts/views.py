from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from .models import User, WorkerProfile, ClientProfile
from .serializers import CustomUserCreateSerializer, WorkerProfileSerializer, ClientProfileSerializer, UserSerializer, LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
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
