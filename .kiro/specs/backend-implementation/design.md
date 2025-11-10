# Backend Design Document

## Overview

The BeefLine backend is built with Django 4+ and Django REST Framework, providing a robust RESTful API for the cattle marketplace. The architecture follows Django best practices with clear separation between models, serializers, views, and business logic.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Django Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Users App  │  │  Cattle App  │  │   Core App   │      │
│  │              │  │              │  │              │      │
│  │ - Models     │  │ - Models     │  │ - Settings   │      │
│  │ - Views      │  │ - Views      │  │ - URLs       │      │
│  │ - Serializers│  │ - Serializers│  │ - Middleware │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│              Django REST Framework Layer                     │
│  - Authentication (JWT)                                      │
│  - Permissions                                               │
│  - Serialization                                             │
│  - ViewSets & Routers                                        │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                            │
│              PostgreSQL with PostGIS                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Django 4.2+
- **API**: Django REST Framework 3.14+
- **Database**: PostgreSQL 14+
- **Authentication**: djangorestframework-simplejwt
- **File Storage**: Django Storages (S3-compatible)
- **Image Processing**: Pillow
- **API Documentation**: drf-spectacular
- **Testing**: pytest-django
- **Caching**: Redis (optional)

## Data Models

### User Model (Custom)

```python
class User(AbstractUser):
    """Custom user model extending Django's AbstractUser"""
    
    # Additional fields
    phone_number = models.CharField(max_length=20)
    region = models.CharField(max_length=50, choices=REGION_CHOICES)
    user_type = models.CharField(
        max_length=10,
        choices=[('buyer', 'Buyer'), ('seller', 'Seller')]
    )
    is_verified = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Fields:**
- Inherits: username, email, password, first_name, last_name from AbstractUser
- phone_number: Contact number with validation
- region: Ghanaian region (Ashanti, Northern Savannah, etc.)
- user_type: 'buyer' or 'seller'
- is_verified: Verification status for sellers

### Cattle Model

```python
class Cattle(models.Model):
    """Model representing a cattle listing"""
    
    # Basic information
    breed = models.CharField(
        max_length=50,
        choices=[
            ('West African Shorthorn', 'West African Shorthorn'),
            ('Zebu', 'Zebu'),
            ('Sanga', 'Sanga')
        ]
    )
    age = models.IntegerField(help_text="Age in months")
    weight = models.DecimalField(max_digits=6, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Health and details
    health_notes = models.TextField(blank=True)
    vaccination_status = models.BooleanField(default=False)
    feeding_history = models.TextField(blank=True)
    
    # Location and seller
    region = models.CharField(max_length=50, choices=REGION_CHOICES)
    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='cattle_listings'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['breed', 'region']),
            models.Index(fields=['price']),
            models.Index(fields=['-created_at']),
        ]
```

### CattleImage Model

```python
class CattleImage(models.Model):
    """Model for cattle photos"""
    
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
    
    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
```

### HealthDocument Model

```python
class HealthDocument(models.Model):
    """Model for health certificates and vaccination records"""
    
    cattle = models.ForeignKey(
        Cattle,
        on_delete=models.CASCADE,
        related_name='health_certificates'
    )
    document = models.FileField(upload_to='health_documents/')
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('health_certificate', 'Health Certificate'),
            ('vaccination_record', 'Vaccination Record')
        ]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
```

## API Endpoints

### Authentication Endpoints

```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/token/refresh/
POST   /api/auth/logout/
```

**Register Request:**
```json
{
  "username": "john_seller",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+233123456789",
  "region": "Ashanti",
  "user_type": "seller"
}
```

**Login Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "john_seller",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+233123456789",
    "region": "Ashanti",
    "user_type": "seller",
    "is_verified": false
  }
}
```

### Cattle Endpoints

```
GET    /api/cattle/                    # List cattle with filters
POST   /api/cattle/                    # Create cattle (sellers only)
GET    /api/cattle/{id}/               # Get cattle details
PUT    /api/cattle/{id}/               # Update cattle (owner only)
PATCH  /api/cattle/{id}/               # Partial update
DELETE /api/cattle/{id}/               # Delete cattle (owner only)
POST   /api/cattle/{id}/images/        # Upload images
GET    /api/cattle/{id}/images/        # List images
DELETE /api/cattle/{id}/images/{img_id}/ # Delete image
POST   /api/cattle/{id}/documents/     # Upload documents
GET    /api/cattle/{id}/documents/     # List documents
```

**List Cattle Query Parameters:**
```
?breed=Zebu
&region=Ashanti
&min_price=3000
&max_price=8000
&min_age=12
&max_age=48
&min_weight=300
&max_weight=600
&vaccinated=true
&sort=-price
&page=1
&page_size=12
```

**Cattle List Response:**
```json
{
  "count": 45,
  "next": "http://api.example.com/api/cattle/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "breed": "Zebu",
      "age": 24,
      "weight": "450.00",
      "price": "5000.00",
      "health_notes": "Healthy and well-fed",
      "vaccination_status": true,
      "feeding_history": "Grass-fed with supplements",
      "region": "Ashanti",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "seller": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+233123456789",
        "region": "Ashanti",
        "is_verified": true
      },
      "images": [
        {
          "id": 1,
          "image": "http://cdn.example.com/cattle_images/cow1.jpg",
          "thumbnail": "http://cdn.example.com/cattle_thumbnails/cow1_thumb.jpg",
          "is_primary": true
        }
      ],
      "health_certificates": [
        {
          "id": 1,
          "document_type": "health_certificate",
          "uploaded_at": "2024-01-15T10:35:00Z"
        }
      ]
    }
  ]
}
```

### User Endpoints

```
GET    /api/users/profile/             # Get current user profile
PUT    /api/users/profile/             # Update profile
PATCH  /api/users/profile/             # Partial update
POST   /api/users/change-password/     # Change password
GET    /api/users/{id}/cattle/         # Get user's cattle listings
```

## Serializers

### UserSerializer

```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'region', 'user_type', 'is_verified',
            'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']
```

### CattleSerializer

```python
class CattleSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    images = CattleImageSerializer(many=True, read_only=True)
    health_certificates = HealthDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cattle
        fields = '__all__'
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']
    
    def validate_age(self, value):
        if value < 1 or value > 300:
            raise serializers.ValidationError(
                "Age must be between 1 and 300 months"
            )
        return value
    
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Price must be a positive number"
            )
        return value
```

## ViewSets

### CattleViewSet

```python
class CattleViewSet(viewsets.ModelViewSet):
    queryset = Cattle.objects.select_related('seller').prefetch_related(
        'images', 'health_certificates'
    )
    serializer_class = CattleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['breed', 'region', 'vaccination_status']
    search_fields = ['breed', 'health_notes', 'region']
    ordering_fields = ['price', 'age', 'weight', 'created_at']
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Similar filters for age and weight
        # ...
        
        return queryset.filter(is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
```

## Permissions

### Custom Permission Classes

```python
class IsSeller(permissions.BasePermission):
    """Only sellers can create cattle listings"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'seller'
        )

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only owners can edit/delete their cattle"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user
```

## File Handling

### Image Upload and Processing

```python
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile

def optimize_image(image_file, max_size=(1200, 1200)):
    """Optimize and resize uploaded images"""
    img = Image.open(image_file)
    
    # Convert to RGB if necessary
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
    
    # Resize maintaining aspect ratio
    img.thumbnail(max_size, Image.LANCZOS)
    
    # Save optimized image
    output = BytesIO()
    img.save(output, format='JPEG', quality=85, optimize=True)
    output.seek(0)
    
    return InMemoryUploadedFile(
        output, 'ImageField', 
        f"{image_file.name.split('.')[0]}.jpg",
        'image/jpeg', output.getbuffer().nbytes, None
    )

def create_thumbnail(image_file, size=(300, 300)):
    """Create thumbnail version of image"""
    # Similar to optimize_image but with smaller size
    pass
```

## Error Handling

### Custom Exception Handler

```python
from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response = {
            'error': True,
            'message': str(exc),
            'status_code': response.status_code
        }
        
        if hasattr(exc, 'detail'):
            custom_response['details'] = exc.detail
        
        response.data = custom_response
    
    return response
```

## Testing Strategy

### Unit Tests
- Model validation
- Serializer validation
- Custom methods and properties
- Permission classes

### Integration Tests
- API endpoint functionality
- Authentication flow
- File upload
- Search and filtering
- Pagination

### Test Example

```python
class CattleAPITestCase(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            username='seller1',
            password='testpass123',
            user_type='seller'
        )
        self.client.force_authenticate(user=self.seller)
    
    def test_create_cattle(self):
        data = {
            'breed': 'Zebu',
            'age': 24,
            'weight': 450,
            'price': 5000,
            'region': 'Ashanti',
            'vaccination_status': True
        }
        response = self.client.post('/api/cattle/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Cattle.objects.count(), 1)
```

## Performance Optimization

### Database Optimization
- Use select_related() for foreign keys
- Use prefetch_related() for reverse relations
- Add indexes on frequently queried fields
- Implement database connection pooling

### Caching Strategy
- Cache cattle list responses (5 minutes)
- Cache user profiles (10 minutes)
- Invalidate cache on updates
- Use Redis for distributed caching

### Query Optimization
```python
# Optimized queryset
Cattle.objects.select_related('seller').prefetch_related(
    Prefetch('images', queryset=CattleImage.objects.filter(is_primary=True)),
    'health_certificates'
).filter(is_active=True)
```

## Security Considerations

1. **Authentication**: JWT tokens with short expiration
2. **Authorization**: Role-based permissions
3. **Input Validation**: Comprehensive serializer validation
4. **File Upload**: Validate file types and sizes
5. **SQL Injection**: Use Django ORM (parameterized queries)
6. **XSS Protection**: Django's built-in escaping
7. **CSRF Protection**: Enabled for state-changing operations
8. **HTTPS**: Enforce in production
9. **Rate Limiting**: Implement throttling for API endpoints
10. **Sensitive Data**: Never log passwords or tokens

## Deployment Configuration

### Environment Variables
```
DEBUG=False
SECRET_KEY=<random-secret-key>
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ALLOWED_HOSTS=api.beefline.com
CORS_ALLOWED_ORIGINS=https://beefline.com
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_STORAGE_BUCKET_NAME=beefline-media
```

### Production Settings
- DEBUG=False
- Secure cookies
- HTTPS redirect
- Static/media files on CDN
- Database connection pooling
- Logging configuration
- Error monitoring (Sentry)
