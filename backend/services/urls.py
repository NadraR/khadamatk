from django.urls import path
from . import views

urlpatterns = [
    path("categories/", views.service_categories, name="service_categories"),
    path("categories/<int:pk>/", views.service_category_detail, name="service_category_detail"),

    path("", views.service_list, name="service_list"),
    path("<int:pk>/", views.service_detail, name="service_detail"),
]


# GET /api/services/categories/ → عرض كل الكاتيجوريز

# POST /api/services/categories/ → إنشاء كاتيجوري جديدة

# GET /api/services/categories/1/ → عرض كاتيجوري برقم ID = 1

# PUT /api/services/categories/1/ → تعديل الكاتيجوري رقم 1

# DELETE /api/services/categories/1/ → حذف الكاتيجوري رقم 1

# GET /api/services/ → عرض كل الخدمات (مع الفلاتر)

# POST /api/services/ → إنشاء خدمة جديدة

# GET /api/services/1/ → عرض تفاصيل الخدمة رقم 1

# PUT /api/services/1/ → تعديل الخدمة رقم 1

# DELETE /api/services/1/ → حذف الخدمة رقم 1