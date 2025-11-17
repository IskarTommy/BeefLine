from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Cattle(models.Model):
    """Main cattle listing model"""
    
    # Breed Choices
    BREED_CHOICES = [
        ('WEST_AFRICAN_SHORTHORN', 'West African Shorthorn'),
        ('ZEBU', 'Zebu'),
        ('SANGA', 'Sanga'),
        ('CROSSBREED', 'Crossbreed'),
        ('OTHER', 'Other'),
    ]
    
    # Gender Choices
    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
    ]
    
    # Health Status Choices
    HEALTH_STATUS_CHOICES = [
        ('EXCELLENT', 'Excellent'),
        ('GOOD', 'Good'),
        ('FAIR', 'Fair'),
        ('POOR', 'Poor'),
    ]
    
    # Basic Information
    breed = models.CharField(
        max_length=50,
        choices=BREED_CHOICES,
        db_index=True
    )
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )
    age_months = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(300)],
        help_text='Age in months (0-300)'
    )
    weight_kg = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Weight in kilograms'
    )
    
    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Price in Ghana Cedis (GHS)',
        db_index=True
    )
    is_negotiable = models.BooleanField(
        default=True,
        help_text='Is the price negotiable?'
    )
    
    # Health Information
    health_status = models.CharField(
        max_length=20,
        choices=HEALTH_STATUS_CHOICES,
        default='GOOD'
    )
    vaccination_status = models.BooleanField(
        default=False,
        help_text='Has the cattle been vaccinated?'
    )
    last_vaccination_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date of last vaccination'
    )
    health_notes = models.TextField(
        blank=True,
        help_text='Additional health information'
    )
    feeding_history = models.TextField(
        blank=True,
        help_text='Feeding and nutrition history'
    )
    
    # Location
    region = models.CharField(
        max_length=50,
        choices=settings.AUTH_USER_MODEL and [
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
        ],
        db_index=True
    )
    city = models.CharField(max_length=100, blank=True)
    location_details = models.TextField(
        blank=True,
        help_text='Specific location or directions'
    )
    
    # Seller Information
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cattle_listings'
    )
    
    # Description
    title = models.CharField(
        max_length=200,
        help_text='Short title for the listing'
    )
    description = models.TextField(
        help_text='Detailed description of the cattle'
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text='Is this listing active?',
        db_index=True
    )
    is_sold = models.BooleanField(
        default=False,
        help_text='Has this cattle been sold?'
    )
    sold_date = models.DateTimeField(
        null=True,
        blank=True
    )
    
    # Statistics
    view_count = models.IntegerField(
        default=0,
        help_text='Number of times this listing has been viewed'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Cattle'
        verbose_name_plural = 'Cattle'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['breed', 'region']),
            models.Index(fields=['price', '-created_at']),
            models.Index(fields=['seller', 'is_active']),
            models.Index(fields=['is_active', 'is_sold']),
        ]
    
    def __str__(self):
        return f"{self.get_breed_display()} - {self.title} (GHS {self.price})"
    
    def mark_as_sold(self):
        """Mark cattle as sold"""
        self.is_sold = True
        self.is_active = False
        self.sold_date = timezone.now()
        self.save(update_fields=['is_sold', 'is_active', 'sold_date'])
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def get_age_display(self):
        """Return age in years and months"""
        years = self.age_months // 12
        months = self.age_months % 12
        if years > 0:
            return f"{years} year(s) {months} month(s)"
        return f"{months} month(s)"
    
    def has_health_certificate(self):
        """Check if cattle has health certificates"""
        return self.health_documents.filter(document_type='HEALTH_CERTIFICATE').exists()
    
    def has_vaccination_record(self):
        """Check if cattle has vaccination records"""
        return self.health_documents.filter(document_type='VACCINATION_RECORD').exists()
    
    @property
    def primary_image(self):
        """Get the primary image for this cattle"""
        return self.images.filter(is_primary=True).first() or self.images.first()


class CattleImage(models.Model):
    """Images for cattle listings"""
    
    cattle = models.ForeignKey(
        Cattle,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(
        upload_to='cattle_images/%Y/%m/%d/',
        help_text='Cattle image'
    )
    caption = models.CharField(
        max_length=200,
        blank=True,
        help_text='Optional image caption'
    )
    is_primary = models.BooleanField(
        default=False,
        help_text='Is this the primary/featured image?'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Cattle Image'
        verbose_name_plural = 'Cattle Images'
        ordering = ['-is_primary', 'uploaded_at']
    
    def __str__(self):
        return f"Image for {self.cattle.title}"
    
    def save(self, *args, **kwargs):
        """Ensure only one primary image per cattle"""
        if self.is_primary:
            # Set all other images for this cattle to non-primary
            CattleImage.objects.filter(
                cattle=self.cattle,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class HealthDocument(models.Model):
    """Health certificates and vaccination records"""
    
    DOCUMENT_TYPE_CHOICES = [
        ('HEALTH_CERTIFICATE', 'Health Certificate'),
        ('VACCINATION_RECORD', 'Vaccination Record'),
        ('VET_REPORT', 'Veterinary Report'),
        ('OTHER', 'Other Document'),
    ]
    
    cattle = models.ForeignKey(
        Cattle,
        on_delete=models.CASCADE,
        related_name='health_documents'
    )
    document_type = models.CharField(
        max_length=30,
        choices=DOCUMENT_TYPE_CHOICES
    )
    document = models.FileField(
        upload_to='health_documents/%Y/%m/%d/',
        help_text='PDF or image file'
    )
    document_name = models.CharField(
        max_length=200,
        help_text='Name/title of the document'
    )
    issue_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date the document was issued'
    )
    expiry_date = models.DateField(
        null=True,
        blank=True,
        help_text='Expiry date (if applicable)'
    )
    notes = models.TextField(
        blank=True,
        help_text='Additional notes about this document'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Health Document'
        verbose_name_plural = 'Health Documents'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.document_name}"
    
    def is_expired(self):
        """Check if document has expired"""
        if self.expiry_date:
            return timezone.now().date() > self.expiry_date
        return False
