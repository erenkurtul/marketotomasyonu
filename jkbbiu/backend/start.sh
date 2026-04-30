#!/bin/bash
# Backend startup script for .NET deployment

# Load environment variables from .env file
if [ -f /app/backend/.env ]; then
    export $(grep -v '^#' /app/backend/.env | xargs)
fi

# Set .NET paths
export DOTNET_ROOT=/app/.dotnet
export PATH=$DOTNET_ROOT:$PATH

# Change to backend directory
cd /app/backend

# Run the .NET application
exec dotnet run --urls http://0.0.0.0:8001
