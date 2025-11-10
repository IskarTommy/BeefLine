@echo off
REM BeefLine Backend Setup Script for Windows

echo Setting up BeefLine Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed
    exit /b 1
)

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please update .env file with your configuration
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Update the .env file with your database credentials
echo 2. Create the PostgreSQL database: CREATE DATABASE beefline_db;
echo 3. Run migrations: python manage.py migrate
echo 4. Create a superuser: python manage.py createsuperuser
echo 5. Start the server: python manage.py runserver

pause
