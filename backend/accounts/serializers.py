from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from .models import User, WorkerProfile, ClientProfile
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django import forms
from django.contrib.auth import get_user_model



# 🔹 Custom Token Serializer (للتوكين)
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom Token Serializer - لو عايزة تزودي بيانات في الـ JWT
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # تزودي بيانات زيادة في الـ payload
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role   # ممكن تضيفي role كمان

        return token


# 🔹 Custom User Create Serializer (للتسجيل)
class CustomUserCreateSerializer(BaseUserCreateSerializer):
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        help_text="Select 'worker' for service providers or 'client' for service seekers"
    )

    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = tuple(BaseUserCreateSerializer.Meta.fields) + ('role', 'phone')
        extra_kwargs = {
            'phone': {'required': True},
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        """تأكد إن الإيميل مش مستخدم قبل كده"""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_phone(self, value):
        """تأكد إن رقم التليفون مش مستخدم قبل كده"""
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def validate(self, attrs):
        """تحقق إضافي من الباسورد"""
        attrs = super().validate(attrs)
        password = attrs.get('password')
        if password:
            if not any(char.isdigit() for char in password):
                raise serializers.ValidationError({"password": "Password must contain at least one digit."})
            if not any(char.isupper() for char in password):
                raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter."})
        return attrs

    def create(self, validated_data):
        """إنشاء يوزر جديد + إضافة role + إنشاء profile"""
        role = validated_data.pop('role')
        user = super().create(validated_data)
        user.role = role
        user.save()

        # إنشاء profile حسب الدور
        if role == "worker":
            WorkerProfile.objects.create(user=user)
        elif role == "client":
            ClientProfile.objects.create(user=user)

        return user

    def update(self, instance, validated_data):
        """ممنوع تغيير role بعد التسجيل"""
        if 'role' in validated_data and validated_data['role'] != instance.role:
            raise serializers.ValidationError({"role": "Role cannot be changed after registration."})
        return super().update(instance, validated_data)


# 🔹 User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'first_name', 'last_name', 'bio']
        read_only_fields = ['email', 'role']


# 🔹 Worker Profile Serializer
class WorkerProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    bio = serializers.CharField(source="user.bio", read_only=True)
    joined_date = serializers.DateTimeField(source="user.date_joined", read_only=True)

    class Meta:
        model = WorkerProfile
        fields = [
        "id", "user","username","user_id", "job_title", "hourly_rate",
        "experience_years", "skills", "services_provided", "certifications", "estimated_price",
        "created_at", "updated_at", "first_name", "last_name", "email", "phone", "bio", "joined_date"
        ]
        read_only_fields = ["user", "created_at", "updated_at", "username", "first_name", "last_name", "email", "phone", "bio", "joined_date"]


# 🔹 Client Profile Serializer
class ClientProfileSerializer(serializers.ModelSerializer):
    # Add user fields to the serializer
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    bio = serializers.CharField(source='user.bio', read_only=True)
    joined_date = serializers.DateTimeField(source='user.date_joined', read_only=True)
    
    class Meta:
        model = ClientProfile
        fields = [
            "id", "user", "preferred_contact_method",
            "address", "notes",
            "created_at", "updated_at",
            # User fields
            "username", "first_name", "last_name", 
            "email", "phone", "bio", "joined_date"
        ]
        read_only_fields = ["user", "created_at", "updated_at", "username", "first_name", "last_name", "email", "phone", "bio", "joined_date"]


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ('id', 'username', 'email', 'first_name', 'last_name')  # اختار اللي تحب تعرضه


User = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        attrs['user'] = user
        return attrs


# class WorkerProfileSerializer(serializers.ModelSerializer):
#     user = UserSerializer(read_only=True)

#     class Meta:
#         model = WorkerProfile
#         fields = ["id", "user", "specialization", "experience", "rating"]

