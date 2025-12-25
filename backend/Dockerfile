# Base image: Miniconda for Python + Conda package management
FROM continuumio/miniconda3:latest

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    LD_LIBRARY_PATH=/opt/conda/lib:$LD_LIBRARY_PATH \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Install system dependencies required for GIS
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgeos-dev \
    libgdal-dev \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python, GDAL, GEOS, PROJ via conda
RUN conda install -c conda-forge -y \
    python=3.11 \
    gdal \
    geos \
    proj \
    psycopg2 \
    && conda clean -afy

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8080

# Run Gunicorn with Railway PORT variable
CMD ["sh", "-c", "gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8080} --workers 4 --timeout 120"]
