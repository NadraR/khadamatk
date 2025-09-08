# 🚀 Railway Deployment Checklist

## ✅ **Pre-Deployment Setup (COMPLETED)**

- [x] Fixed backend module errors (invoices app)
- [x] Created Railway configuration files
- [x] Updated Django settings for production
- [x] Generated secure Django secret key
- [x] Tested database connection
- [x] Created deployment documentation

## 📋 **Railway Deployment Steps**

### **Step 1: Configure Environment Variables**

Go to your [Railway Project Dashboard](https://railway.com/project/153461ae-dbd8-4a1b-8fba-27de20f7c71b?environmentId=00ee56c1-cffe-4006-bf9f-93c7f5b34fda) and add these **EXACT** environment variables:

```env
DATABASE_URL=postgis://postgres:gcc4fC62c5dAcgdC226AGCdbbgdECgC1@maglev.proxy.rlwy.net:34104/railway
DJANGO_SECRET_KEY=django-insecure-nym6zbg%f$27)9y%k&w34385$at)!az#x@tlqrg((px_0%^h(_
DEBUG=False
ALLOWED_HOSTS=your-railway-app.railway.app,khadamatk.vercel.app,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://khadamatk.vercel.app,http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,https://khadamatk.vercel.app
```

**Important Notes:**
- Replace `your-railway-app.railway.app` with your actual Railway domain after deployment
- Keep all other values exactly as shown

### **Step 2: Deploy from GitHub**

1. **Connect Repository:**
   - Click **"+ New"** → **"GitHub Repo"**
   - Select your `Khadamat-service-proj` repository
   - Set **Root Directory** to: `khadamatk/backend`

2. **Railway Auto-Detection:**
   - Railway will detect Python/Django automatically
   - It will use the `railway.json` and `Procfile` we created

3. **Build Process:**
   - Railway will install dependencies from `requirements.txt`
   - Run migrations automatically
   - Collect static files
   - Start Gunicorn server

### **Step 3: Update Domain Configuration**

After deployment, Railway will assign a domain like: `your-app-name-production.railway.app`

**Update Environment Variables:**
1. Go to **Variables** in Railway dashboard
2. Update `ALLOWED_HOSTS` to include your actual Railway domain:
   ```env
   ALLOWED_HOSTS=your-actual-railway-domain.railway.app,khadamatk.vercel.app,localhost,127.0.0.1
   ```

### **Step 4: Test Deployment**

#### **Health Checks:**
- **API Root**: `https://your-domain.railway.app/api/`
- **Admin Panel**: `https://your-domain.railway.app/admin/`

#### **Test API Endpoints:**
```bash
# Test authentication
curl -X POST https://your-domain.railway.app/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'

# Test orders endpoint
curl -X GET https://your-domain.railway.app/api/orders/ \
  -H "Authorization: Bearer your-jwt-token"
```

### **Step 5: Update Frontend Configuration**

Update your frontend `ApiService.js`:

```javascript
// Change from localhost to Railway domain
const API_BASE_URL = 'https://your-actual-railway-domain.railway.app/api/'
```

## 🔧 **Configuration Files Created**

- ✅ `railway.json` - Railway deployment config
- ✅ `Procfile` - Process definition
- ✅ `deploy.sh` - Automated deployment script
- ✅ `.railwayignore` - Files to ignore
- ✅ `railway-production-env.txt` - Environment variables

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **Build Failures:**
   ```bash
   # Check Railway logs
   railway logs
   
   # Verify requirements.txt
   pip install -r requirements.txt
   ```

2. **Database Connection Issues:**
   ```bash
   # Test connection locally
   export DATABASE_URL="your-database-url"
   python manage.py check --database default
   ```

3. **CORS Errors:**
   - Verify `CORS_ALLOWED_ORIGINS` includes your frontend domain
   - Check `CSRF_TRUSTED_ORIGINS` includes both domains

4. **Static Files Not Loading:**
   - Ensure `collectstatic` runs during deployment
   - Check `STATIC_ROOT` and `STATICFILES_STORAGE` settings

### **Debug Commands:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and connect
railway login
railway link

# Run commands on Railway
railway run python manage.py migrate
railway run python manage.py createsuperuser
railway run python manage.py collectstatic

# View logs
railway logs
```

## ✅ **Post-Deployment Checklist**

- [ ] Environment variables configured
- [ ] Application deployed successfully
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] Admin panel accessible
- [ ] API endpoints responding
- [ ] CORS configured correctly
- [ ] Frontend can connect to backend
- [ ] Create superuser account
- [ ] Test core functionality

## 🎉 **Success Indicators**

- ✅ Railway build completes without errors
- ✅ Application starts successfully
- ✅ Database connection established
- ✅ API endpoints return expected responses
- ✅ Frontend can authenticate and make requests
- ✅ No CORS errors in browser console

## 📞 **Support Resources**

- **Railway Docs**: https://docs.railway.app/
- **Django Deployment**: https://docs.djangoproject.com/en/5.2/howto/deployment/
- **Railway Discord**: https://discord.gg/railway

---

**Your Configuration Summary:**
- **Database**: Railway PostgreSQL (PostGIS enabled)
- **Frontend**: https://khadamatk.vercel.app
- **Backend**: Will be deployed to Railway
- **Environment**: Production-ready with security settings
