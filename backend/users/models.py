from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user"""
        if not email:
            raise ValueError('Email address is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hashes the password
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('user_type', 'BOTH')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with enhanced security features"""
    
    # User Type Choices
    USER_TYPE_CHOICES = [
        ('BUYER', 'Buyer'),
        ('SELLER', 'Seller'),
        ('BOTH', 'Both Buyer and Seller'),
    ]
    
    # Ghana Regions
    REGION_CHOICES = [
        ('ASHANTI', 'Ashanti'),
        ('BRONG_AHAFO', 'Brong Ahafo'),
        ('CENTRAL', 'Central'),
        ('EASTERN', 'Eastern'),
        ('GREATER_ACCRA', 'Greater Accra'),
        ('NORTHERN', 'Northern'),
        ('UPPER_EAST', 'Upper East'),
        ('UPPER_WEST', 'Upper West'),
        ('VOLTA', 'Volta'),
        ('WESTERN', 'Western'),
        ('SAVANNAH', 'Savannah'),
        ('BONO_EAST', 'Bono East'),
        ('AHAFO', 'Ahafo'),
        ('WESTERN_NORTH', 'Western North'),
        ('NORTH_EAST', 'North East'),
        ('OTI', 'Oti'),
    ]
    
    # Phone number validator
    phone_regex = RegexValidator(
        regex=r'^\+?233?\d{9,10}$',
        message="Phone number must be in format: '+233XXXXXXXXX' or '0XXXXXXXXX'"
    )
    
    # Authentication Fields
    email = models.EmailField(
        unique=True,
        db_index=True,
        error_messages={
            'unique': 'A user with this email already exists.',
        }
    )
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=15,
        unique=True,
        db_index=True,
        help_text='Ghana phone number format'
    )
    
    # Personal Information
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        null=True,
        blank=True
    )
    
    # User Type and Role
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='BUYER'
    )
    
    # Location
    region = models.CharField(
        max_length=50,
        choices=REGION_CHOICES,
        blank=True
    )
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    
    # Seller-Specific Fields
    business_name = models.CharField(max_length=200, blank=True)
    is_verified_seller = models.BooleanField(
        default=False,
        help_text='Admin-approved verified seller'
    )
    verification_documents = models.FileField(
        upload_to='verification_docs/',
        null=True,
        blank=True,
        help_text='ID or business registration documents'
    )
    
    # Account Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(
        default=False,
        help_text='Email/phone verified'
    )
    is_staff = models.BooleanField(default=False)
    
    # Security Fields
    failed_login_attempts = models.IntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    two_factor_enabled = models.BooleanField(default=False)
    last_password_change = models.DateTimeField(auto_now_add=True)
    
    # Payment (for future use)
    payment_verified = models.BooleanField(default=False)
    payment_provider_id = models.CharField(
        max_length=255,
        blank=True,
        help_text='Payment gateway customer ID'
    )
    
    # Timestamps
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone_number', 'user_type']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['user_type']),
            models.Index(fields=['is_verified_seller']),
        ]
    
    def __str__(self):
        return f"{self.email} ({self.get_user_type_display()})"
    
    def get_full_name(self):
        """Return the user's full name"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """Return the user's first name"""
        return self.first_name
    
    def is_account_locked(self):
        """Check if account is temporarily locked"""
        if self.account_locked_until:
            if timezone.now() < self.account_locked_until:
                return True
            else:
                # Lock period expired, reset
                self.account_locked_until = None
                self.failed_login_attempts = 0
                self.save(update_fields=['account_locked_until', 'failed_login_attempts'])
        return False
    
    def lock_account(self, duration_minutes=30):
        """Lock account for specified duration"""
        self.account_locked_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        self.save(update_fields=['account_locked_until'])
    
    def increment_failed_login(self):
        """Increment failed login attempts and lock if threshold reached"""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.lock_account(duration_minutes=30)
        self.save(update_fields=['failed_login_attempts'])
    
    def reset_failed_login(self):
        """Reset failed login attempts on successful login"""
        if self.failed_login_attempts > 0:
            self.failed_login_attempts = 0
            self.save(update_fields=['failed_login_attempts'])
    
    def can_sell(self):
        """Check if user can list cattle for sale"""
        return self.user_type in ['SELLER', 'BOTH']
    
    def can_buy(self):
        """Check if user can purchase cattle"""
        return self.user_type in ['BUYER', 'BOTH']
