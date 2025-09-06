# 🚀 Railway Deployment Guide for Khadamat Backend

## Overview
This guide will help you deploy your Django backend to Railway platform.

## Prerequisites
- Railway account
- Git repository
- Railway CLI (optional but recommended)

## 📋 Step-by-Step Deployment

### 1. **Prepare Your Repository**

Make sure your backend code is in a Git repository and pushed to GitHub/GitLab.

### 2. **Connect to Railway**

Visit your Railway project: https://railway.com/project/153461ae-dbd8-4a1b-8fba-27de20f7c71b

### 3. **Configure Environment Variables**

In your Railway project dashboard, go to **Variables** and add these:

```env
# Essential Variables
DJANGO_SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
DEBUG=False
ALLOWED_HOSTS=your-railway-domain.railway.app,localhost,127.0.0.1

# CORS Settings (Update with your frontend domain)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
CSRF_TRUSTED_ORIGINS=https://your-railway-domain.railway.app,https://your-frontend-domain.vercel.app

# Database (Railway PostgreSQL addon will provide this)
DATABASE_URL=postgresql://user:password@host:port/database

# Optional: Redis for channels
REDIS_URL=redis://default:password@host:port
```

### 4. **Add PostgreSQL Database**

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create `DATABASE_URL` environment variable

### 5. **Deploy from GitHub**

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Choose the `backend` folder as root directory
4. Railway will automatically detect it's a Python/Django project

### 6. **Configure Build Settings**

Railway should automatically detect your Python app, but you can customize:

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
python manage.py migrate && python manage.py collectstatic --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
```

### 7. **Domain Configuration**

1. Go to **Settings** → **Domains**
2. Railway will provide a domain like: `your-app-name.railway.app`
3. Update your `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` with this domain

## 🔧 Configuration Files Created

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT",
    "healthcheckPath": "/api/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `Procfile`
```
web: python manage.py migrate && python manage.py collectstatic --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate
```

### `deploy.sh`
Automated deployment script with migrations and static files collection.

## 🌐 Frontend Integration

After deployment, update your frontend API base URL to:
```javascript
const API_BASE_URL = 'https://your-railway-domain.railway.app/api/'
```

## 🔍 Testing the Deployment

### Health Check Endpoints:
- **API Root**: `https://your-domain.railway.app/api/`
- **Admin Panel**: `https://your-domain.railway.app/admin/`
- **API Documentation**: `https://your-domain.railway.app/api/docs/` (if configured)

### Test API Endpoints:
```bash
# Test authentication
curl -X POST https://your-domain.railway.app/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'

# Test orders endpoint
curl -X GET https://your-domain.railway.app/api/orders/ \
  -H "Authorization: Bearer your-jwt-token"
```

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Update `CORS_ALLOWED_ORIGINS` with your frontend domain
   - Add Railway domain to `CSRF_TRUSTED_ORIGINS`

2. **Database Connection Issues**
   - Ensure PostgreSQL addon is added
   - Check `DATABASE_URL` environment variable

3. **Static Files Not Loading**
   - Verify `STATIC_ROOT` and `STATICFILES_STORAGE` settings
   - Check if `collectstatic` runs during deployment

4. **Migration Errors**
   - Run migrations manually: `railway run python manage.py migrate`
   - Check database permissions

### Debug Commands:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Run commands on Railway
railway run python manage.py migrate
railway run python manage.py createsuperuser
railway run python manage.py collectstatic

# View logs
railway logs
```

## 📊 Monitoring

### Railway Dashboard:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Application and system logs
- **Deployments**: History and rollback options

### Health Monitoring:
```python
# Add to your Django URLs for health checks
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def health_check(request):
    return JsonResponse({"status": "healthy", "timestamp": timezone.now().isoformat()})
```

## 🔐 Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS Only**: Railway provides HTTPS by default
3. **Database Security**: Use Railway's managed PostgreSQL
4. **CORS**: Restrict to your frontend domains only
5. **Admin Access**: Create strong superuser credentials

## 📈 Performance Optimization

1. **Gunicorn Workers**: Adjust based on your needs
2. **Database Connection Pooling**: Use `conn_max_age`
3. **Static Files**: Use WhiteNoise for serving
4. **Caching**: Add Redis for session/cache storage

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] PostgreSQL database added
- [ ] CORS settings updated
- [ ] Static files configuration verified
- [ ] Migrations applied
- [ ] Superuser created
- [ ] API endpoints tested
- [ ] Frontend integration verified
- [ ] Health checks working
- [ ] Logs monitored for errors

## 📞 Support

- **Railway Documentation**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **Django Documentation**: https://docs.djangoproject.com/

## 🎉 Success!

Your Django backend should now be live on Railway! 

**Your API Base URL**: `https://your-domain.railway.app/api/`

Update your frontend to use this URL and test all functionality.


