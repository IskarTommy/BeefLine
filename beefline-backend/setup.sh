#!/bin/bash

# BeefLine Backend Setup Script

echo "Setting up BeefLine Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update .env file with your configuration"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your database credentials"
echo "2. Create the PostgreSQL database: CREATE DATABASE beefline_db;"
echo "3. Run migrations: python manage.py migrate"
echo "4. Create a superuser: python manage.py createsuperuser"
echo "5. Start the server: python manage.py runserver"
