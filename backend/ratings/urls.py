from django.urls import path
from . import views

urlpatterns = [
    path("order/<int:order_id>/", views.create_rating, name="create_rating"),  # POST
    path("service/<int:service_id>/", views.service_ratings, name="service_ratings"),  # GET
]

'''
POST /api/ratings/order/5/ → إنشاء تقييم للطلب رقم 5 (بعد إكماله)
GET /api/ratings/service/2/ → عرض كل التقييمات الخاصة بالخدمة رقم 2
'''