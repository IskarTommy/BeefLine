"""
User models for BeefLine application.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    """
    
    REGION_CHOICES = [
        ('Ashanti', 'Ashanti'),
        ('Brong-Ahafo', 'Brong-Ahafo'),
        ('Central', 'Central'),
        ('Eastern', 'Eastern'),
        ('Greater Accra', 'Greater Accra'),
        ('Northern', 'Northern'),
        ('Upper East', 'Upper East'),
        ('Upper West', 'Upper West'),
        ('Volta', 'Volta'),
        ('Western', 'Western'),
        ('Northern Savannah', 'Northern Savannah'),
        ('Bono East', 'Bono East'),
        ('Ahafo', 'Ahafo'),
        ('Oti', 'Oti'),
        ('Western North', 'Western North'),
        ('North East', 'North East'),
    ]
    
    USER_TYPE_CHOICES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
    ]
    
    phone_number = models.CharField(max_length=20)
    region = models.CharField(max_length=50, choices=REGION_CHOICES)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username
    
    class Meta:
        ordering = ['-created_at']
