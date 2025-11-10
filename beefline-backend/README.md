# BeefLine Backend

Django REST Framework backend for the BeefLine cattle marketplace.

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- PostgreSQL 14 or higher
- pip or virtualenv

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example`:
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

5. Update the `.env` file with your database credentials and other settings.

6. Create the PostgreSQL database:
```sql
CREATE DATABASE beefline_db;
```

7. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

8. Create a superuser:
```bash
python manage.py createsuperuser
```

9. Run the development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## Project Structure

```
beefline-backend/
├── core/               # Project settings and configuration
│   ├── settings.py     # Django settings
│   ├── urls.py         # Main URL configuration
│   └── exceptions.py   # Custom exception handlers
├── users/              # User authentication and management
│   ├── models.py       # User model
│   └── admin.py        # Admin configuration
├── cattle/             # Cattle listings management
│   ├── models.py       # Cattle, CattleImage, HealthDocument models
│   └── admin.py        # Admin configuration
├── manage.py           # Django management script
└── requirements.txt    # Python dependencies
```

## Environment Variables

See `.env.example` for all available configuration options.

## Running Tests

```bash
pytest
```

## Code Quality

Format code with Black:
```bash
black .
```

Check code with Flake8:
```bash
flake8
```
