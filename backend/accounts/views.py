from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
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
from google.oauth2 import id_token
import requests as http
from rest_framework.permissions import AllowAny, IsAuthenticated
from google.auth.transport import requests as google_requests
import logging
from django.shortcuts import get_object_or_404  

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
        
        # Check if user has saved locations (new users won't have any)
        from location.models import UserLocation
        has_location = UserLocation.objects.filter(user=user).exists()
        
        # Check if worker profile is complete (new workers won't have complete profiles)
        profile_completed = True
        if user.role == 'worker':
            profile_completed = False  # New workers need to complete their profile
        
        response_data.update({
            'refresh': str(refresh),
            'access': str(access),
            'user_id': user.id,
            'has_location': has_location,
            'profile_completed': profile_completed,
        })
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class WorkerProfileCreateView(generics.CreateAPIView, generics.RetrieveAPIView):
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Get the worker profile for the current user"""
        if hasattr(self.request.user, 'worker_profile'):
            return self.request.user.worker_profile
        else:
            from django.http import Http404
            raise Http404("Worker profile not found")
    
    def get(self, request, *args, **kwargs):
        """Handle GET requests to retrieve worker profile"""
        print(f"[DEBUG] WorkerProfileCreateView.get called for user {request.user.id}")
        
        try:
            profile = self.get_object()
            serializer = self.get_serializer(profile)
            
            print(f"[DEBUG] Returning profile data: {serializer.data}")
            
            return Response({
                'profile': serializer.data,
                'profile_completed': profile.is_complete,
                'message': 'Profile retrieved successfully'
            })
        except Exception as e:
            print(f"[DEBUG] Error retrieving profile: {e}")
            return Response({
                'error': 'Worker profile not found',
                'profile_completed': False
            }, status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        print(f"[DEBUG] perform_create called for user {self.request.user.id}")
        print(f"[DEBUG] User role: {self.request.user.role}")
        print(f"[DEBUG] Serializer validated_data: {serializer.validated_data}")
        
        # Allow any authenticated user to create a worker profile
        # Update user role to worker if they're creating a worker profile
        if self.request.user.role != 'worker':
            self.request.user.role = 'worker'
            self.request.user.save()
            print(f"[DEBUG] Updated user {self.request.user.id} role to worker")
        
        # Check if user already has a worker profile
        if hasattr(self.request.user, 'worker_profile'):
            print(f"[DEBUG] User already has worker profile, updating...")
            # Update existing profile
            existing_profile = self.request.user.worker_profile
            for field, value in serializer.validated_data.items():
                print(f"[DEBUG] Setting {field} = {value}")
                setattr(existing_profile, field, value)
            existing_profile.save()
            print(f"[DEBUG] Updated existing worker profile for user {self.request.user.id}")
            self.profile_instance = existing_profile
        else:
            print(f"[DEBUG] Creating new worker profile...")
            # Create new profile
            profile = serializer.save(user=self.request.user)
            print(f"[DEBUG] Created new worker profile for user {self.request.user.id}")
            self.profile_instance = profile
    
    def create(self, request, *args, **kwargs):
        """Override create to return custom response with completion status"""
        print(f"[DEBUG] WorkerProfileCreateView.create called for user {request.user.id}")
        print(f"[DEBUG] Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        print(f"[DEBUG] Serializer data: {serializer.initial_data}")
        
        if not serializer.is_valid():
            print(f"[DEBUG] Serializer validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"[DEBUG] Serializer is valid, calling perform_create")
        self.perform_create(serializer)
        
        # Return the profile data with completion status
        profile_serializer = WorkerProfileSerializer(self.profile_instance)
        print(f"[DEBUG] Profile instance: {self.profile_instance}")
        print(f"[DEBUG] Profile is_complete: {self.profile_instance.is_complete}")
        
        # Create a service automatically for this worker if profile is complete
        if self.profile_instance.is_complete:
            try:
                from services.views import create_service_for_worker
                from django.test import RequestFactory
                
                # Create a mock request for the service creation
                factory = RequestFactory()
                service_request = factory.post('/api/services/create-for-worker/', {
                    'worker_id': request.user.id
                })
                service_request.user = request.user
                
                # Call the service creation function
                service_response = create_service_for_worker(service_request)
                print(f"[DEBUG] Service creation response: {service_response.data}")
                
            except Exception as e:
                print(f"[DEBUG] Error creating service for worker: {e}")
                # Don't fail the profile creation if service creation fails
        
        response_data = {
            'profile': profile_serializer.data,
            'profile_completed': self.profile_instance.is_complete,
            'message': 'Profile updated successfully' if hasattr(request.user, 'worker_profile') else 'Profile created successfully'
        }
        
        print(f"[DEBUG] Returning response: {response_data}")
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class ClientProfileCreateView(generics.CreateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'client':
            raise PermissionDenied("Only clients can create a client profile.")
        serializer.save(user=self.request.user) 

class WorkerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return WorkerProfile.objects.get(user=self.request.user)
        except WorkerProfile.DoesNotExist:
            raise NotFound("Worker profile does not exist. Please create it first.")

class ClientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return ClientProfile.objects.get(user=self.request.user)
        except ClientProfile.DoesNotExist:
            raise NotFound("Client profile does not exist. Please create it first.")

@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_client_profile(request):
    """
    Update the authenticated client's own profile
    """
    try:
        profile = ClientProfile.objects.get(user=request.user)
    except ClientProfile.DoesNotExist:
        return Response(
            {"detail": "Client profile does not exist. Please create it first."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = ClientProfileSerializer(
        profile, data=request.data, partial=True
    )  # partial=True عشان يقدر يعدّل جزء بس من البيانات
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_worker_profile(request):
    worker_profile = request.user.worker_profile
    serializer = WorkerProfileSerializer(worker_profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_user(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------- Client Full Update ----------------
@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def client_full_update(request):
    user = request.user

    # 1️⃣ حدّد البروفايل الخاص بالعميل
    profile = get_object_or_404(ClientProfile, user=user)

    # 2️⃣ قسم الداتا بين User + ClientProfile
    user_fields = ['username', 'email', 'first_name', 'last_name', 'password']
    user_data = {k: v for k, v in request.data.items() if k in user_fields}
    profile_data = {k: v for k, v in request.data.items() if k not in user_fields}

    # 3️⃣ عدّل بيانات الـ User
    user_serializer = UserSerializer(user, data=user_data, partial=True)
    # 4️⃣ عدّل بيانات الـ ClientProfile
    profile_serializer = ClientProfileSerializer(profile, data=profile_data, partial=True)

    if user_serializer.is_valid() and profile_serializer.is_valid():
        user_serializer.save()
        profile_serializer.save()
        return Response({
            "user": user_serializer.data,
            "profile": profile_serializer.data
        }, status=status.HTTP_200_OK)

    return Response({
        "user_errors": user_serializer.errors,
        "profile_errors": profile_serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ---------------- Worker Full Update ----------------
@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def worker_full_update(request):
    user = request.user

    # 1️⃣ حدّد البروفايل الخاص بالوركر
    profile = get_object_or_404(WorkerProfile, user=user)

    # 2️⃣ قسم الداتا بين User + WorkerProfile
    user_fields = ['username', 'email', 'first_name', 'last_name', 'password', 'bio']
    user_data = {k: v for k, v in request.data.items() if k in user_fields}
    profile_data = {k: v for k, v in request.data.items() if k not in user_fields}

    # 3️⃣ عدّل بيانات الـ User
    user_serializer = UserSerializer(user, data=user_data, partial=True)
    # 4️⃣ عدّل بيانات الـ WorkerProfile
    profile_serializer = WorkerProfileSerializer(profile, data=profile_data, partial=True)

    if user_serializer.is_valid() and profile_serializer.is_valid():
        user_serializer.save()
        profile_serializer.save()
        return Response({
            "user": user_serializer.data,
            "profile": profile_serializer.data
        }, status=status.HTTP_200_OK)

    return Response({
        "user_errors": user_serializer.errors,
        "profile_errors": profile_serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

# لستة كل العمال (ممكن تبقى public)
@api_view(["GET"])
@permission_classes([AllowAny])   # كده أي حد يقدر يشوفهم حتى من غير login
def list_workers(request):
    workers = WorkerProfile.objects.all()
    serializer = WorkerProfileSerializer(workers, many=True)
    return Response(serializer.data)

# بروفايل عامل واحد (read-only)
@api_view(["GET"])
@permission_classes([AllowAny])
def worker_detail(request, user_id):
    worker = get_object_or_404(WorkerProfile, user__id=user_id)
    serializer = WorkerProfileSerializer(worker)
    return Response(serializer.data)



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

        # Check if user has saved locations
        from location.models import UserLocation
        has_location = UserLocation.objects.filter(user=user).exists()
        
        # Check if worker profile is complete
        profile_completed = True
        if user.role == 'worker':
            try:
                worker_profile = user.worker_profile
                profile_completed = worker_profile.is_complete
            except:
                profile_completed = False

        return Response({
            'refresh': str(refresh),
            'access': str(access),
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': getattr(user, 'role', None),
            'has_location': has_location,
            'profile_completed': profile_completed,
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
            
            # Check if GOOGLE_CLIENT_ID is configured
            if not settings.GOOGLE_CLIENT_ID:
                logger.error("[GoogleLogin DEBUG] GOOGLE_CLIENT_ID not configured")
                return Response({
                    "error": "Google OAuth not configured. Please contact administrator."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
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

            # Check if user has saved locations
            from location.models import UserLocation
            has_location = UserLocation.objects.filter(user=user).exists()
            
            # Check if worker profile is complete
            profile_completed = True
            if user.role == 'worker':
                try:
                    worker_profile = user.worker_profile
                    profile_completed = worker_profile.is_complete
                except:
                    profile_completed = False

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
                "has_location": has_location,
                "profile_completed": profile_completed,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("[GoogleLogin DEBUG] Unexpected error during Google login")
            return Response({"error": f"Authentication failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)