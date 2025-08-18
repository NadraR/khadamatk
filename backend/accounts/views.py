from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import User, WorkerProfile, ClientProfile
from .serializers import UserRegisterSerializer, WorkerProfileSerializer, ClientProfileSerializer


class UserRegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"message": "User registered successfully", "role": user.role}, status=status.HTTP_201_CREATED)


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