#!/bin/bash

# ISLE Backend Startup Script

echo "Starting ISLE Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Set PYTHONPATH to include the parent directory for imports
export PYTHONPATH="${PYTHONPATH}:$(pwd)/.."

# Start the FastAPI server
echo "Starting FastAPI server..."
cd app
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo "Server started at http://localhost:8000"
echo "API documentation available at http://localhost:8000/docs"