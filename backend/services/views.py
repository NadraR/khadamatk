from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Service, ServiceCategory, Favorite
from .serializers import ServiceSerializer, ServiceDetailSerializer, ServiceCategorySerializer, ServiceSearchSerializer, FavoriteSerializer
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D

@api_view(["GET", "POST"])
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

@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def service_list(request):
    if request.method == "GET":
        services = Service.objects.filter(is_deleted=False).annotate(
            rating_avg=Avg("reviews__score"),
            rating_count=Count("reviews")
        )
        category_id = request.query_params.get("category")
        city = request.query_params.get("city")
        if category_id:
            services = services.filter(category_id=category_id)
        if city:
            services = services.filter(city__icontains=city)
        serializer = ServiceDetailSerializer(services, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(provider=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
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
        return Response({"error": "lat and lng are required floats"}, status=status.HTTP_400_BAD_REQUEST)
    radius_km = float(request.GET.get("radius_km", 10))
    category_id = request.GET.get("category_id")
    q = request.GET.get("q")
    point = Point(lng, lat, srid=4326)
    qs = Service.objects.filter(is_deleted=False, is_active=True, provider__workerprofile__location__isnull=False)
    if category_id:
        qs = qs.filter(category_id=category_id)
    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
    qs = qs.filter(provider__workerprofile__location__distance_lte=(point, D(km=radius_km))) \
           .annotate(distance_km=Distance('provider__workerprofile__location', point)/1000.0) \
           .order_by('distance_km')
    serializer = ServiceSearchSerializer(qs, many=True, context={"request": request})
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def favorites_list(request):
    favs = Favorite.objects.filter(user=request.user).select_related("service")
    serializer = FavoriteSerializer(favs, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def favorite_add(request):
    service_id = request.data.get("service_id")
    if not service_id:
        return Response({"error": "service_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    service = get_object_or_404(Service, pk=service_id, is_deleted=False)
    fav, created = Favorite.objects.get_or_create(user=request.user, service=service)
    return Response({"status": "ok", "created": created})

@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def favorite_remove(request, service_id):
    Favorite.objects.filter(user=request.user, service_id=service_id).delete()
    return Response({"status": "ok"})
