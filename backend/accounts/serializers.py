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
        """إنشاء يوزر جديد + إضافة role + إنشاء JWT tokens"""
        role = validated_data.pop('role')
        user = super().create(validated_data)
        user.role = role
        user.save()

        # إنشاء JWT tokens مباشرة بعد التسجيل
        refresh = RefreshToken.for_user(user)
        self.tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }
        return user

    def update(self, instance, validated_data):
        """ممنوع تغيير role بعد التسجيل"""
        if 'role' in validated_data and validated_data['role'] != instance.role:
            raise serializers.ValidationError({"role": "Role cannot be changed after registration."})
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        """إرجاع البيانات + التوكنز"""
        data = super().to_representation(instance)
        if hasattr(self, 'tokens'):
            data.update(self.tokens)
        return data


# 🔹 User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'first_name', 'last_name']
        read_only_fields = ['email', 'role']


# 🔹 Worker Profile Serializer
class WorkerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerProfile
        fields = [
            "id", "user", "job_title", "hourly_rate",
            "experience_years", "skills", "location",
            "created_at", "updated_at"
        ]
        read_only_fields = ["user", "created_at", "updated_at"]


# 🔹 Client Profile Serializer
class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        # fields = [
        #     "id", "user", "preferred_contact_method",
        #     "address", "notes", "location",
        #     "created_at", "updated_at"
        # ]
        fields = '__all__'
        widgets = {
            'location': forms.TextInput(attrs={'placeholder': 'lat, lng'})
        }
        read_only_fields = ["user", "created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')  # اختار اللي تحب تعرضه


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
