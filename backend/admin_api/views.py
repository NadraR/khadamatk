from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Avg
from django.contrib.auth import get_user_model
from .serializers import AdminActionLogSerializer
from services.models import Service
from orders.models import Order
from reviews.models import Review
from ratings.models import Rating
# from invoices.models import Invoice  # Temporarily disabled - invoices app incomplete
from .models import AdminActionLog
from rest_framework.views import APIView

from .serializers import (
    AdminUserSerializer, AdminServiceSerializer, AdminOrderSerializer,
    AdminReviewSerializer, AdminRatingSerializer, AdminActionLogSerializer
    # AdminInvoiceSerializer,  # Temporarily disabled - invoices app incomplete
)

User = get_user_model()

# ---------- Users ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_users(request):
    if request.method == 'GET':
        users = User.objects.all().order_by('id')
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AdminUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdminUserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# ---------- Services ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_services(request):
    if request.method == 'GET':
        services = Service.objects.all().order_by('id')
        serializer = AdminServiceSerializer(services, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AdminServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_service_detail(request, pk):
    try:
        service = Service.objects.get(pk=pk)
    except Service.DoesNotExist:
        return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdminServiceSerializer(service)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AdminServiceSerializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        service.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# ---------- Orders ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_orders(request):
    if request.method == 'GET':
        orders = Order.objects.all().order_by('id')
        serializer = AdminOrderSerializer(orders, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AdminOrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_order_detail(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdminOrderSerializer(order)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AdminOrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        order.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# ---------- Reviews ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_reviews(request):
    if request.method == 'GET':
        reviews = Review.objects.all().order_by('id')
        serializer = AdminReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AdminReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_review_detail(request, pk):
    try:
        review = Review.objects.get(pk=pk)
    except Review.DoesNotExist:
        return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdminReviewSerializer(review)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AdminReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        review.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# ---------- Ratings ----------
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_ratings(request):
    if request.method == 'GET':
        ratings = Rating.objects.all().order_by('id')
        serializer = AdminRatingSerializer(ratings, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AdminRatingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_rating_detail(request, pk):
    try:
        rating = Rating.objects.get(pk=pk)
    except Rating.DoesNotExist:
        return Response({'error': 'Rating not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdminRatingSerializer(rating)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AdminRatingSerializer(rating, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        rating.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# ---------- Invoices - Temporarily disabled ----------
# @api_view(['GET', 'POST'])
# @permission_classes([IsAdminUser])
# def admin_invoices(request):
#     if request.method == 'GET':
#         invoices = Invoice.objects.all().order_by('id')
#         serializer = AdminInvoiceSerializer(invoices, many=True)
#         return Response(serializer.data)
#     elif request.method == 'POST':
#         serializer = AdminInvoiceSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['GET', 'PUT', 'DELETE'])
# @permission_classes([IsAdminUser])
# def admin_invoice_detail(request, pk):
#     try:
#         invoice = Invoice.objects.get(pk=pk)
#     except Invoice.DoesNotExist:
#         return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

#     if request.method == 'GET':
#         serializer = AdminInvoiceSerializer(invoice)
#         return Response(serializer.data)
#     elif request.method == 'PUT':
#         serializer = AdminInvoiceSerializer(invoice, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     elif request.method == 'DELETE':
#         invoice.delete()
#         return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# ---------- Stats ----------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    # users_count = User.objects.count()
    # services_count = Service.objects.count()
    # orders_total = Order.objects.count()
    # orders_pending = Order.objects.filter(status='pending').count()
    # orders_completed = Order.objects.filter(status='completed').count()
    # orders_cancelled = Order.objects.filter(status='cancelled').count()
    # avg_rating = Rating.objects.aggregate(avg=Avg('score'))['avg']

    return Response({
        "users_count": User.objects.count(),
        "services_count": Service.objects.count(),
        "orders_count": Order.objects.count(),
        "reviews_count": Review.objects.count(),
        "ratings_count": Rating.objects.count(),
        # "invoices_count": Invoice.objects.count(),  # Temporarily disabled
    })

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_logs_view(request):
    """عرض كل اللوجات الخاصة بالـ Admin"""
    logs = AdminActionLog.objects.all().order_by("-timestamp")  # مرتب بالأحدث
    serializer = AdminActionLogSerializer(logs, many=True)
    return Response(serializer.data)



class AdminMeView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": "superadmin" if user.is_superuser else "admin"
        })