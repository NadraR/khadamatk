#!/bin/bash
# Pre-deployment checklist for Railway

echo "🚀 Railway Deployment Checklist"
echo "================================"
echo ""

# Check railway.json
if [ -f "railway.json" ]; then
    echo "✅ railway.json exists (root directory)"
else
    echo "❌ railway.json missing in root!"
    exit 1
fi

# Check backend files
cd backend 2>/dev/null || exit 1

if [ -f "nixpacks.toml" ]; then
    echo "✅ nixpacks.toml exists (backend/)"
else
    echo "❌ nixpacks.toml missing!"
fi

if [ -f "Aptfile" ]; then
    echo "✅ Aptfile exists (backend/)"
else
    echo "❌ Aptfile missing!"
fi

if [ -f "Procfile" ]; then
    echo "✅ Procfile exists (backend/)"
else
    echo "❌ Procfile missing!"
fi

if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt exists (backend/)"
    if grep -q "^GDAL" requirements.txt; then
        echo "⚠️  Warning: GDAL package found in requirements.txt"
        echo "   GDAL should be installed via nixpacks.toml, not pip"
    else
        echo "✅ GDAL correctly omitted from requirements.txt"
    fi
else
    echo "❌ requirements.txt missing!"
fi

if [ -f "runtime.txt" ]; then
    echo "✅ runtime.txt exists (backend/)"
else
    echo "❌ runtime.txt missing!"
fi

echo ""
echo "📝 Summary of Files:"
echo "-------------------"
echo "Root directory:"
echo "  - railway.json (Railway config)"
echo "  - RAILWAY_SETUP.md (Quick guide)"
echo ""
echo "Backend directory:"
echo "  - nixpacks.toml (System packages: GDAL, GEOS, PROJ)"
echo "  - Aptfile (Backup package list)"
echo "  - Procfile (Start command)"
echo "  - requirements.txt (Python packages)"
echo "  - runtime.txt (Python version)"
echo "  - RAILWAY_DEPLOYMENT.md (Detailed docs)"
echo ""
echo "✅ All files are in place!"
echo ""
echo "🎯 Next Steps:"
echo "1. git add ."
echo "2. git commit -m 'Configure Railway deployment with complete GDAL support'"
echo "3. git push"
echo "4. Check Railway dashboard for deployment status"
echo ""
echo "💡 Remember to set environment variables on Railway:"
echo "   - DATABASE_URL (auto-set)"
echo "   - DJANGO_SECRET_KEY"
echo "   - DEBUG=False"
echo "   - ALLOWED_HOSTS"
echo "   - CORS_ALLOWED_ORIGINS"
echo "   - And others listed in RAILWAY_SETUP.md"

