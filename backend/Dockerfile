# Base image with Conda for GIS libraries
FROM continuumio/miniconda3:latest

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    LD_LIBRARY_PATH=/opt/conda/lib:/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Install system-level GIS libraries (for compatibility)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgeos-c1v5 \
    libgeos-dev \
    gdal-bin \
    libgdal-dev \
    libproj-dev \
    proj-bin \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python and GIS packages via Conda
RUN conda install -c conda-forge -y \
    python=3.11 \
    gdal \
    geos \
    proj \
    psycopg2 \
    && conda clean -afy

# Create symbolic links for version-specific libraries
# This ensures Django finds libgeos_c.so.1 from conda installation
RUN ln -sf /opt/conda/lib/libgeos_c.so /opt/conda/lib/libgeos_c.so.1 && \
    ln -sf /opt/conda/lib/libgeos.so /opt/conda/lib/libgeos.so.1 && \
    ln -sf /opt/conda/lib/libgdal.so /opt/conda/lib/libgdal.so.32
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Run Gunicorn with Railway PORT variable
CMD ["sh", "-c", "gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8080} --workers 4 --timeout 120"]
