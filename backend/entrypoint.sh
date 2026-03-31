#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
sleep 2

# Initialize database if needed
echo "Initializing database..."
cd /app

# Run seed script to populate demo data
echo "Seeding database with demo data..."
python seed.py

# Run the application
exec python app.py
