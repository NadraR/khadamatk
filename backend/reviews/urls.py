from django.urls import path
from . import views

urlpatterns = [
    path("service/<int:service_id>/", views.service_reviews, name="service_reviews"),
    path("<int:pk>/", views.review_detail, name="review_detail"),
]


# GET /api/reviews/service/1/ → عرض كل الريفيوز الخاصة بالخدمة رقم 1
# POST /api/reviews/service/1/ → إنشاء ريفيو جديد للخدمة رقم 1

# GET /api/reviews/5/ → عرض تفاصيل الريفيو رقم 5
# PUT /api/reviews/5/ → تعديل الريفيو رقم 5
# DELETE /api/reviews/5/ → حذف الريفيو رقم 5