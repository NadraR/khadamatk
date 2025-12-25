# Use official Python runtime as base image
FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for GeoDjango
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal32 \
    libgdal-dev \
    libgeos-c1v5 \
    libgeos-dev \
    libproj25 \
    libproj-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy project files
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE 8080

# Start command - use shell to properly expand PORT variable
CMD ["sh", "-c", "gunicorn core.wsgi --bind 0.0.0.0:${PORT:-8080} --workers 4 --timeout 120"]

