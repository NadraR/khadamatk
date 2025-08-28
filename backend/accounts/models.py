from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.validators import RegexValidator, MinValueValidator
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.gis.db import models as gis_models


class User(AbstractUser):
    phone_regex = RegexValidator(
        regex=r'^01[0-9]{9}$',
        message="Please enter a valid Egyptian phone number (11 digits starting with 01)"
    )
    phone = models.CharField(
        max_length=11,
        validators=[phone_regex],
        unique=False,
        blank=True, null=True,
        verbose_name="Phone Number"
    )
    email = models.EmailField(unique=True, verbose_name="Email Address")

    ROLE_CHOICES = (
        ('worker', 'Worker'),
        ('client', 'Client'),
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        verbose_name="Role"
    )

    auth_provider = models.CharField(
        max_length=50,
        default="email",   # أو "local"
        null=False,
        blank=False,
        verbose_name="Authentication Provider"
    )

    # حل مشكلة الـ related_name clash
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True,
        verbose_name='Groups',
        help_text='The groups this user belongs to'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',
        blank=True,
        verbose_name='User permissions',
        help_text='Specific permissions for this user'
    )

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class BaseProfile(models.Model):
    # location = gis_models.PointField(
    #     srid=4326,
    #     null=True,
    #     blank=True,
    #     verbose_name="Geographic Location"
    # )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        abstract = True


class WorkerProfile(BaseProfile):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='worker_profile',
        verbose_name="User"
    )
    job_title = models.CharField(
        max_length=120,
        verbose_name="Job Title",
        blank=True, null=True
    )
    hourly_rate = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Hourly Rate",
        blank=True, null=True
    )
    experience_years = models.PositiveIntegerField(
        default=0,
        verbose_name="Years of Experience",
        blank=True, null=True
    )
    skills = models.TextField(
        blank=True,
        verbose_name="Skills",
    )

    class Meta:
        verbose_name = 'Worker Profile'
        verbose_name_plural = 'Worker Profiles'

    def __str__(self):
        return f"{self.user.username} - {self.job_title or 'No Title'}"

    def clean(self):
        if self.user.role != 'worker':
            raise ValidationError("This profile is for workers only")


class ClientProfile(BaseProfile):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_profile',
        verbose_name="User"
    )
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=(
            ('email', 'Email'),
            ('phone', 'Phone'),
        ),
        default='phone',
        verbose_name="Preferred Contact Method"
    )
    address = models.TextField(
        blank=True,
        verbose_name="Detailed Address"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Additional Notes"
    )

    class Meta:
        verbose_name = 'Client Profile'
        verbose_name_plural = 'Client Profiles'

    def __str__(self):
        return f"{self.user.username} - Client"

    def clean(self):
        if self.user.role != 'client':
            raise ValidationError("This profile is for clients only")
