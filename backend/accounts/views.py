from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import User, WorkerProfile, ClientProfile
from .serializers import CustomUserCreateSerializer, WorkerProfileSerializer, ClientProfileSerializer

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