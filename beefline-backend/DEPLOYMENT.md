# Deployment Guide

## Docker Deployment

### Using Docker Compose (Recommended for Development)

1. Make sure Docker and Docker Compose are installed on your system.

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration.

4. Build and start the containers:
```bash
docker-compose up --build
```

5. Run migrations:
```bash
docker-compose exec web python manage.py migrate
```

6. Create a superuser:
```bash
docker-compose exec web python manage.py createsuperuser
```

The API will be available at `http://localhost:8000/`

### Using Docker (Production)

1. Build the Docker image:
```bash
docker build -t beefline-backend .
```

2. Run the container:
```bash
docker run -d \
  -p 8000:8000 \
  -e DEBUG=False \
  -e SECRET_KEY=your-secret-key \
  -e DB_NAME=beefline_db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your-password \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  --name beefline-api \
  beefline-backend
```

## Manual Deployment

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Nginx (for production)
- Supervisor or systemd (for process management)

### Setup Steps

1. Clone the repository and navigate to the backend directory.

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables (create `.env` file).

5. Run migrations:
```bash
python manage.py migrate
```

6. Collect static files:
```bash
python manage.py collectstatic --noinput
```

7. Create a superuser:
```bash
python manage.py createsuperuser
```

### Running with Gunicorn

```bash
gunicorn --bind 0.0.0.0:8000 --workers 4 core.wsgi:application
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.beefline.com;

    location /static/ {
        alias /path/to/beefline-backend/static/;
    }

    location /media/ {
        alias /path/to/beefline-backend/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Environment Variables

Required environment variables for production:

- `DEBUG=False`
- `SECRET_KEY` - Generate a secure random key
- `ALLOWED_HOSTS` - Your domain names
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` - Database credentials
- `CORS_ALLOWED_ORIGINS` - Frontend URLs

Optional for S3 storage:

- `USE_S3=True`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_STORAGE_BUCKET_NAME`
- `AWS_S3_REGION_NAME`

## Health Check

The API provides a health check endpoint at `/api/health/` (to be implemented in later tasks).

## Monitoring

Consider setting up:
- Sentry for error tracking
- New Relic or DataDog for performance monitoring
- CloudWatch or similar for logs

## Backup

Regular database backups:
```bash
pg_dump -U postgres beefline_db > backup_$(date +%Y%m%d).sql
```

## Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Use a strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` properly
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set up firewall rules
- [ ] Use environment variables for sensitive data
- [ ] Keep dependencies updated
- [ ] Set up regular backups
- [ ] Configure rate limiting
- [ ] Enable security headers
