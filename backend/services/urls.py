from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path("categories/", views.service_categories, name="service_categories"),
    path("categories/<int:pk>/", views.service_category_detail, name="service_category_detail"),

    # Services
    path("", views.service_list, name="service_list"),
    path("<int:pk>/", views.service_detail, name="service_detail"),
    path("nearby/", views.service_search, name="services_nearby"),
    # Favorites
    path("favorites/", views.favorites_list, name="favorites_list"),
    path("favorites/add/", views.favorite_add, name="favorite_add"),
    path("favorites/remove/<int:service_id>/", views.favorite_remove, name="favorite_remove"),
    path("types/", views.service_types, name="service_types"),
]


# GET /api/services/categories/ → عرض كل الكاتيجوريز

# POST /api/services/categories/ → إنشاء كاتيجوري جديدة

# GET /api/services/categories/1/ → عرض كاتيجوري برقم ID = 1

# PUT /api/services/categories/1/ → تعديل الكاتيجوري رقم 1

# DELETE /api/services/categories/1/ → حذف الكاتيجوري رقم 1

# GET /api/services/types/ → عرض كل الخدمات (مع الفلاتر)

# POST /api/services/ → إنشاء خدمة جديدة

# GET /api/services/1/ → عرض تفاصيل الخدمة رقم 1

# PUT /api/services/1/ → تعديل الخدمة رقم 1

# DELETE /api/services/1/ → حذف الخدمة رقم 1

# GET /api/services/nearby/ - البحث عن الخدمات القريبة حذف الخدمة رقم 1
