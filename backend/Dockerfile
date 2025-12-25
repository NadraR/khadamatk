# ===============================
# Stage 1: Builder
# ===============================
FROM continuumio/miniconda3:latest AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Install system dependencies for GIS
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

# Install Python + GIS packages via Conda
RUN conda install -c conda-forge -y \
    python=3.11 \
    gdal \
    geos \
    proj \
    psycopg2 \
    && conda clean -afy

# Create symbolic links for Django GIS
RUN ln -sf /opt/conda/lib/libgeos_c.so /opt/conda/lib/libgeos_c.so.1 && \
    ln -sf /opt/conda/lib/libgeos.so /opt/conda/lib/libgeos.so.1 && \
    ln -sf /opt/conda/lib/libgdal.so /opt/conda/lib/libgdal.so.32

# Set working directory
WORKDIR /app

# Copy requirements.txt first (build context is now backend/)
COPY requirements.txt ./requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy all application code (everything in backend/)
COPY . .


# ===============================
# Stage 2: Final image
# ===============================
FROM continuumio/miniconda3:latest

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    LD_LIBRARY_PATH=/opt/conda/lib:/usr/lib/x86_64-linux-gnu \
    GEOS_LIBRARY_PATH=/opt/conda/lib/libgeos_c.so.1 \
    GDAL_LIBRARY_PATH=/opt/conda/lib/libgdal.so \
    PATH=/opt/conda/bin:$PATH

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgeos-c1v5 \
    gdal-bin \
    libproj-dev \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Conda environment from builder (includes all GIS libraries + symlinks)
COPY --from=builder /opt/conda /opt/conda

# Copy application code from builder
COPY --from=builder /app /app

# Recreate symbolic links (safety measure)
RUN ln -sf /opt/conda/lib/libgeos_c.so /opt/conda/lib/libgeos_c.so.1 && \
    ln -sf /opt/conda/lib/libgeos.so /opt/conda/lib/libgeos.so.1 && \
    ln -sf /opt/conda/lib/libgdal.so /opt/conda/lib/libgdal.so.32

# Expose port
EXPOSE 8080

# Run migrations and start Gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8080} --workers 4 --timeout 120"]
