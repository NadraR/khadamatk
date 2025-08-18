from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Count, Avg

from .permissions import IsStaffOrSuperuser
from .serializers import (
    AdminUserSerializer, AdminServiceSerializer, AdminOrderSerializer,
    AdminReviewSerializer, AdminRatingSerializer
)

from django.contrib.auth import get_user_model
from services.models import Service
from orders.models import Order
from reviews.models import Review
from ratings.models import Rating

User = get_user_model()

# -------- Users --------
@api_view(['GET', 'POST'])
@permission_classes([IsStaffOrSuperuser])
def admin_users(request):
    if request.method == 'GET':
        users = User.objects.all().order_by('-id')
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = AdminUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsStaffOrSuperuser])
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
        return Response(status=status.HTTP_204_NO_CONTENT)


# -------- Services --------
@api_view(['GET'])
@permission_classes([IsStaffOrSuperuser])
def admin_services(request):
    services = Service.objects.all().order_by('-id')
    serializer = AdminServiceSerializer(services, many=True)
    return Response(serializer.data)


# -------- Orders --------
@api_view(['GET'])
@permission_classes([IsStaffOrSuperuser])
def admin_orders(request):
    orders = Order.objects.all().order_by('-id')
    serializer = AdminOrderSerializer(orders, many=True)
    return Response(serializer.data)


# -------- Reviews --------
@api_view(['GET'])
@permission_classes([IsStaffOrSuperuser])
def admin_reviews(request):
    reviews = Review.objects.all().order_by('-id')
    serializer = AdminReviewSerializer(reviews, many=True)
    return Response(serializer.data)


# -------- Ratings --------
@api_view(['GET'])
@permission_classes([IsStaffOrSuperuser])
def admin_ratings(request):
    ratings = Rating.objects.all().order_by('-id')
    serializer = AdminRatingSerializer(ratings, many=True)
    return Response(serializer.data)


# -------- Dashboard Stats --------
@api_view(['GET'])
@permission_classes([IsStaffOrSuperuser])
def admin_stats(request):
    users_count = User.objects.count()
    services_count = Service.objects.count()
    orders_total = Order.objects.count()
    orders_pending = Order.objects.filter(status='pending').count()
    orders_completed = Order.objects.filter(status='completed').count()
    orders_cancelled = Order.objects.filter(status='cancelled').count()

    top_services = (
        Order.objects.values('service__name')
        .annotate(num=Count('id'))
        .order_by('-num')[:5]
    )
    top_providers = (
        Order.objects.values('provider__username')
        .annotate(num=Count('id'))
        .order_by('-num')[:5]
    )
    avg_rating = Rating.objects.aggregate(avg=Avg('score'))['avg']

    return Response({
        'users_count': users_count,
        'services_count': services_count,
        'orders_total': orders_total,
        'orders_pending': orders_pending,
        'orders_completed': orders_completed,
        'orders_cancelled': orders_cancelled,
        'avg_rating': avg_rating or 0,
        'top_services': list(top_services),
        'top_providers': list(top_providers),
    })
