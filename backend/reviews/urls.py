from django.urls import path
from . import views

urlpatterns = [
    # GET /api/reviews/service/1/ → كل الريفيوز الخاصة بخدمة معينة
    # POST /api/reviews/service/1/ → إضافة ريفيو جديد لخدمة معينة
    path("service/<int:service_id>/", views.service_reviews, name="service_reviews"),

    # POST /api/reviews/create/ → إنشاء ريفيو بدون order
    # POST /api/reviews/create/5/ → إنشاء ريفيو مرتبط بـ order
    path("create/", views.create_review, name="create_review"),
    path("create/<int:order_id>/", views.create_review, name="create_review_order"),

    # GET /api/reviews/5/ → عرض ريفيو واحد
    # PUT /api/reviews/5/ → تعديل ريفيو
    # DELETE /api/reviews/5/ → حذف ريفيو
    path("<int:review_id>/", views.review_detail, name="review_detail"),
]
