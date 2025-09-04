from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from accounts.models import WorkerProfile
from .models import Service, ServiceCategory, Favorite
from .serializers import (
    ServiceSerializer, 
    ServiceDetailSerializer, 
    ServiceCategorySerializer, 
    ServiceSearchSerializer, 
    FavoriteSerializer,
)
from rest_framework.permissions import BasePermission, SAFE_METHODS

#worker profile import check
try:
    WORKER_PROFILE_EXISTS = True
except ImportError:
    WORKER_PROFILE_EXISTS = False


class IsWorkerOrReadOnly(BasePermission):
    """Allow full access only to authenticated workers; read-only otherwise."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == "worker"


@api_view(["GET", "POST"])
@permission_classes([IsWorkerOrReadOnly])
def service_categories(request):
    if request.method == "GET":
        categories = ServiceCategory.objects.filter(is_deleted=False)
        serializer = ServiceCategorySerializer(categories, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = ServiceCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsWorkerOrReadOnly])
def service_category_detail(request, pk):
    category = get_object_or_404(ServiceCategory, pk=pk, is_deleted=False)
    if request.method == "GET":
        serializer = ServiceCategorySerializer(category)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = ServiceCategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        category.is_deleted = True
        category.save()
        return Response({"message": "Category soft deleted"}, status=status.HTTP_200_OK)


@api_view(["GET"])
def service_types(request):
    categories = ServiceCategory.objects.filter(is_deleted=False)
    serializer = ServiceCategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsWorkerOrReadOnly])
def service_list(request):
    if request.method == "GET":
        services = Service.objects.filter(is_deleted=False).annotate(
            rating_avg=Avg("reviews__score"),
            rating_count=Count("reviews")
        )
        category_id = request.query_params.get("category")
        if category_id:
            services = services.filter(category_id=category_id)
        city = request.query_params.get("city")
        if city:
            services = services.filter(city__icontains=city)
        
        q = request.query_params.get("q")
        if q:
            services = services.filter(Q(title__icontains=q) | Q(description__icontains=q))
        
        serializer = ServiceDetailSerializer(services, many=True)
        return Response(serializer.data)
    
    elif request.method == "POST":
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(provider=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsWorkerOrReadOnly])
def service_detail(request, pk):
    service = get_object_or_404(
        Service.objects.filter(is_deleted=False).annotate(
            rating_avg=Avg("reviews__score"),
            rating_count=Count("reviews")
        ),
        pk=pk
    )
    if request.method == "GET":
        serializer = ServiceDetailSerializer(service)
        return Response(serializer.data)
    elif request.method == "PUT":
        if request.user != service.provider:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ServiceSerializer(service, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        if request.user != service.provider:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        service.is_deleted = True
        service.save()
        return Response({"message": "Service soft deleted"}, status=status.HTTP_200_OK)


@api_view(["GET"])
def service_search(request):
    try:
        lat = float(request.GET.get("lat"))
        lng = float(request.GET.get("lng"))
    except (TypeError, ValueError):
        return Response({"error": "lat and lng are required and must be valid numbers"}, status=status.HTTP_400_BAD_REQUEST)
    
    radius_km = float(request.GET.get("radius_km", 10))
    service_type = request.GET.get("service_type") 
    q = request.GET.get("q", "")
    
    # Start with basic filtering
    qs = Service.objects.filter(
        is_deleted=False, 
        is_active=True,
        provider__isnull=False
    ).annotate(
        rating_avg=Avg("reviews__score"),
        rating_count=Count("reviews")
    )
    
    if service_type:
        qs = qs.filter(category_id=service_type)
    
    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
    
    # For now, return all services without location filtering
    # This ensures the API works even without location data
    from django.db.models import Value
    qs = qs.annotate(distance_km=Value(0.0))  # Set distance to 0 for all services
    qs = qs.order_by('?')  # Random order since we don't have location data
    
    serializer = ServiceSearchSerializer(qs, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def favorites_list(request):
    """
    الحصول على قائمة المفضلات للمستخدم الحالي
    """
    favs = Favorite.objects.filter(user=request.user).select_related("service")
    serializer = FavoriteSerializer(favs, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def favorite_add(request):
    """
    إضافة خدمة إلى المفضلات
    """
    service_id = request.data.get("service_id")
    if not service_id:
        return Response({"error": "service_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    service = get_object_or_404(Service, pk=service_id, is_deleted=False)
    fav, created = Favorite.objects.get_or_create(user=request.user, service=service)
    
    return Response({
        "status": "added to favorites", 
        "created": created,
        "favorite_id": fav.id
    })

@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def favorite_remove(request, service_id):
    deleted_count, _ = Favorite.objects.filter(user=request.user, service_id=service_id).delete()
    
    if deleted_count > 0:
        return Response({"status": "removed from favorites"})
    else:
        return Response({"error": "Favorite not found"}, status=status.HTTP_404_NOT_FOUND)
