"""
Cattle models for BeefLine application.
"""
from django.db import models
from django.conf import settings


class Cattle(models.Model):
    """
    Model representing a cattle listing.
    """
    
    BREED_CHOICES = [
        ('West African Shorthorn', 'West African Shorthorn'),
        ('Zebu', 'Zebu'),
        ('Sanga', 'Sanga'),
    ]
    
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
    
    breed = models.CharField(max_length=50, choices=BREED_CHOICES)
    age = models.IntegerField(help_text="Age in months")
    weight = models.DecimalField(max_digits=6, decimal_places=2, help_text="Weight in kg")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price in GHS")
    
    health_notes = models.TextField(blank=True)
    vaccination_status = models.BooleanField(default=False)
    feeding_history = models.TextField(blank=True)
    
    region = models.CharField(max_length=50, choices=REGION_CHOICES)
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cattle_listings'
    )
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.breed} - {self.age} months - GHS {self.price}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Cattle'
        indexes = [
            models.Index(fields=['breed', 'region']),
            models.Index(fields=['price']),
            models.Index(fields=['-created_at']),
        ]


class CattleImage(models.Model):
    """
    Model for cattle photos.
    """
    
    cattle = models.ForeignKey(
        Cattle,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='cattle_images/')
    thumbnail = models.ImageField(
        upload_to='cattle_thumbnails/',
        blank=True,
        null=True
    )
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.cattle}"
    
    class Meta:
        ordering = ['-is_primary', 'uploaded_at']


class HealthDocument(models.Model):
    """
    Model for health certificates and vaccination records.
    """
    
    DOCUMENT_TYPE_CHOICES = [
        ('health_certificate', 'Health Certificate'),
        ('vaccination_record', 'Vaccination Record'),
    ]
    
    cattle = models.ForeignKey(
        Cattle,
        on_delete=models.CASCADE,
        related_name='health_certificates'
    )
    document = models.FileField(upload_to='health_documents/')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.document_type} for {self.cattle}"
    
    class Meta:
        ordering = ['-uploaded_at']
