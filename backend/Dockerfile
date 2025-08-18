FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps for GeoDjango + runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin libgdal-dev libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so.30 \
    GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so.1

# Entrypoint
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
