#!/bin/bash

# Script to start the Django backend server
echo "Starting Django backend server..."

# Navigate to backend directory
cd backend

# Activate virtual environment if it exists
if [ -d "../venv" ]; then
    echo "Activating virtual environment..."
    source ../venv/bin/activate
fi

# Install requirements if needed
echo "Installing requirements..."
pip install -r requirements.txt

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Start the development server
echo "Starting Django development server on port 8000..."
python manage.py runserver 8000
