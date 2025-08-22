from django.urls import path
from . import views

urlpatterns = [
    # Orders
    path("", views.order_list, name="order_list"),
    path("<int:pk>/", views.order_detail, name="order_detail"),

    # Offers (GET list / POST create)
    path("<int:order_id>/offers/", views.offer_list, name="offer_list"),

    # Negotiations (GET list / POST create)
    path("<int:order_id>/negotiations/", views.negotiation_list, name="negotiation_list"),
]


'''
1️⃣ Orders

GET /api/orders/ → عرض كل الطلبات الخاصة بالمستخدم (أو كل الطلبات إذا admin)

POST /api/orders/ → إنشاء طلب جديد

GET /api/orders/5/ → عرض تفاصيل الطلب رقم 5

PUT /api/orders/5/ → تعديل الطلب رقم 5 (client فقط)

DELETE /api/orders/5/ → حذف الطلب رقم 5 (soft delete)

2️⃣ Offers

POST /api/orders/5/offers/ → إنشاء عرض على الطلب رقم 5 من مقدم خدمة

3️⃣ Negotiations

POST /api/orders/5/negotiations/ → إرسال رسالة تفاوض على الطلب رقم 5
'''