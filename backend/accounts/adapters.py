# accounts/adapters.py
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from .models import ClientProfile, WorkerProfile

User = get_user_model()

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """قبل ما التسجيل يبدأ، نحفظ الـ role في الـ sociallogin"""
        role = request.session.get('socialaccount_role', 'client')
        sociallogin.state['role'] = role

    def save_user(self, request, sociallogin, form=None):
        """نحفظ الـ User مع الـ role الصحيح"""
        user = super().save_user(request, sociallogin, form)
        
        # نحط الـ role من الـ session أو من الـ sociallogin state
        role = sociallogin.state.get('role', 'client')
        user.role = role
        user.auth_provider = 'google'  # نحط أن التسجيل كان عن طريق Google
        user.save()
        
        # الـ Signal هتشتغل أوتوماتيك وتنشئ الـ Profile
        return user