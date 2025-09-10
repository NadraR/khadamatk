FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so.30 \
    GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so.1

COPY deploy.sh /deploy.sh
RUN chmod +x /deploy.sh
CMD ["/deploy.sh"]
