# BeefLine Backend - Project Structure

## Overview

This document provides an overview of the Django REST Framework backend structure for the BeefLine cattle marketplace.

## Directory Structure

```
beefline-backend/
├── core/                       # Core Django project settings
│   ├── __init__.py
│   ├── asgi.py                # ASGI configuration
│   ├── wsgi.py                # WSGI configuration
│   ├── settings.py            # Django settings (database, apps, middleware, etc.)
│   ├── urls.py                # Main URL routing
│   └── exceptions.py          # Custom exception handlers
│
├── users/                      # User authentication and management app
│   ├── migrations/
│   │   ├── __init__.py
│   │   └── 0001_initial.py   # Initial user model migration
│   ├── __init__.py
│   ├── admin.py              # Admin interface configuration
│   ├── apps.py               # App configuration
│   ├── models.py             # Custom User model
│   └── urls.py               # User-related URL patterns
│
├── cattle/                     # Cattle listings management app
│   ├── migrations/
│   │   ├── __init__.py
│   │   └── 0001_initial.py   # Initial cattle models migration
│   ├── __init__.py
│   ├── admin.py              # Admin interface for cattle
│   ├── apps.py               # App configuration
│   ├── models.py             # Cattle, CattleImage, HealthDocument models
│   ├── urls.py               # Cattle-related URL patterns
│   └── utils.py              # Image processing utilities
│
├── media/                      # User-uploaded files (created at runtime)
├── static/                     # Static files (created at runtime)
│
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore rules
├── manage.py                  # Django management script
├── requirements.txt           # Python dependencies
├── pytest.ini                 # Pytest configuration
├── Dockerfile                 # Docker image definition
├── docker-compose.yml         # Docker Compose configuration
├── setup.sh                   # Setup script for Linux/Mac
├── setup.bat                  # Setup script for Windows
├── README.md                  # Project documentation
├── DEPLOYMENT.md              # Deployment guide
└── PROJECT_STRUCTURE.md       # This file
```

## Key Components

### Core App
- **settings.py**: Configures Django, REST Framework, JWT authentication, CORS, database, and more
- **urls.py**: Routes API requests to appropriate apps
- **exceptions.py**: Custom error handling for consistent API responses

### Users App
- **models.py**: Custom User model with fields for phone, region, user_type, and verification status
- **admin.py**: Django admin interface for user management

### Cattle App
- **models.py**: Three models:
  - `Cattle`: Main cattle listing with breed, age, weight, price, health info
  - `CattleImage`: Photos associated with cattle listings
  - `HealthDocument`: Health certificates and vaccination records
- **utils.py**: Image optimization and validation utilities
- **admin.py**: Django admin interface for cattle management

## Configuration Files

### Environment Variables (.env)
- Database credentials
- Django secret key
- Debug mode
- CORS settings
- JWT token lifetimes
- File storage configuration

### Requirements
- Django 4.2.7
- Django REST Framework 3.14.0
- djangorestframework-simplejwt 5.3.0
- psycopg2-binary (PostgreSQL adapter)
- Pillow (image processing)
- django-cors-headers
- drf-spectacular (API documentation)
- pytest-django (testing)

## Database Models

### User Model
- Extends Django's AbstractUser
- Additional fields: phone_number, region, user_type, is_verified
- Supports buyer and seller roles
- 16 Ghanaian regions

### Cattle Model
- Breed choices: West African Shorthorn, Zebu, Sanga
- Numeric fields: age (months), weight (kg), price (GHS)
- Health information: notes, vaccination status, feeding history
- Relationships: Foreign key to User (seller)
- Indexes on breed, region, price, and created_at for performance

### CattleImage Model
- Multiple images per cattle listing
- Automatic thumbnail generation
- Primary image designation
- Image optimization on upload

### HealthDocument Model
- PDF and image support
- Document type classification
- Secure file storage

## API Structure (To Be Implemented)

```
/api/
├── auth/                      # Authentication endpoints
│   ├── register/
│   ├── login/
│   ├── token/refresh/
│   └── logout/
│
├── cattle/                    # Cattle management
│   ├── /                     # List/Create cattle
│   ├── /{id}/                # Retrieve/Update/Delete cattle
│   ├── /{id}/images/         # Image management
│   └── /{id}/documents/      # Document management
│
├── users/                     # User management
│   ├── profile/              # User profile
│   └── change-password/      # Password change
│
├── docs/                      # Swagger UI
└── schema/                    # OpenAPI schema
```

## Next Steps

The following tasks remain to be implemented:
1. User authentication endpoints (JWT)
2. Cattle CRUD operations
3. Image upload and processing
4. Health document management
5. Search and filtering
6. Permissions and authorization
7. API documentation
8. Testing
9. Performance optimization
10. Deployment configuration

See `tasks.md` in `.kiro/specs/backend-implementation/` for detailed task list.
