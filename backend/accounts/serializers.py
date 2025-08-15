from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken

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
        value = super().validate_email(value)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        password = attrs.get('password')
        if not any(char.isdigit() for char in password):
            raise serializers.ValidationError({"password": "Password must contain at least one digit."})
        if not any(char.isupper() for char in password):
            raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter."})
        return attrs

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = super().create(validated_data)
        user.role = role
        user.save()
        refresh = RefreshToken.for_user(user)
        self.tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }
        return user

    def update(self, instance, validated_data):
        if 'role' in validated_data and validated_data['role'] != instance.role:
            raise serializers.ValidationError({"role": "Role cannot be changed after registration."})
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(self, 'tokens'):
            data.update(self.tokens)
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'first_name', 'last_name']
        read_only_fields = ['email', 'role']
    
    