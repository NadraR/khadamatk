from django.db.models import Avg, Count, Q
from django.db import models
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
        
        # Add provider filter support
        provider_id = request.query_params.get("provider")
        if provider_id:
            services = services.filter(provider_id=provider_id)
        
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


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_for_worker(request):
    """Create a service for a worker - used when creating orders"""
    try:
        # Get the worker from the request
        worker_id = request.data.get('worker_id')
        if not worker_id:
            return Response(
                {"error": "worker_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get worker profile
        try:
            from accounts.models import WorkerProfile
            worker_profile = WorkerProfile.objects.get(user_id=worker_id)
        except WorkerProfile.DoesNotExist:
            return Response(
                {"error": "Worker profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create a basic service for the worker
        service_data = {
            'title': request.data.get('title', 'خدمة مخصصة'),
            'description': request.data.get('description', 'خدمة مخصصة للطلب'),
            'provider': worker_id,
            'category_id': request.data.get('category_id'),
            'city': request.data.get('city', ''),
            'price': request.data.get('price', 0),
            'is_active': True
        }
        
        serializer = ServiceSerializer(data=service_data)
        if serializer.is_valid():
            service = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {"error": f"Error creating service: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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
    max_results = int(request.GET.get("max_results", 50))  # Increase default limit
    
    from django.contrib.gis.geos import Point
    from django.contrib.gis.db.models.functions import Distance
    from django.contrib.gis.measure import D
    
    # Create point for the search location
    search_point = Point(lng, lat, srid=4326)
    
    # Start with basic service filtering
    qs = Service.objects.filter(
        is_deleted=False, 
        is_active=True,
        provider__isnull=False
    ).annotate(
        rating_avg=Avg("reviews__score"),
        rating_count=Count("reviews")
    )
    
    # Filter by service type if provided
    if service_type:
        try:
            service_type_int = int(service_type)
            qs = qs.filter(category_id=service_type_int)
        except (ValueError, TypeError):
            # If service_type is not a valid integer, try to match by name
            qs = qs.filter(category__name__icontains=service_type)
    
    # Filter by search query if provided
    if q:
        qs = qs.filter(
            Q(title__icontains=q) | 
            Q(description__icontains=q) |
            Q(category__name__icontains=q)
        )
    
    # Now filter by location using provider's locations
    # Join with UserLocation to find services from providers within radius
    from location.models import UserLocation
    
    # Get providers within radius
    nearby_providers = UserLocation.objects.filter(
        user__role='worker',
        location__isnull=False
    ).annotate(
        distance=Distance('location', search_point)
    ).filter(
        location__distance_lte=(search_point, D(km=radius_km))
    ).values_list('user_id', flat=True)
    
    # Filter services by nearby providers
    qs = qs.filter(provider_id__in=nearby_providers)
    
    # Add distance calculation to services based on provider's location
    qs = qs.annotate(
        provider_location=UserLocation.objects.filter(
            user_id=models.OuterRef('provider_id')
        ).values('location')[:1]
    ).annotate(
        distance_km=Distance('provider_location', search_point)
    ).filter(
        distance_km__lte=D(km=radius_km)
    ).order_by('distance_km', '-rating_avg')[:max_results]
    
    # Fallback: if no location-based results, return services without location filtering
    if not qs.exists():
        print(f"No location-based results found, falling back to general search")
        qs = Service.objects.filter(
            is_deleted=False, 
            is_active=True,
            provider__isnull=False
        ).annotate(
            rating_avg=Avg("reviews__score"),
            rating_count=Count("reviews")
        )
        
        if service_type:
            try:
                service_type_int = int(service_type)
                qs = qs.filter(category_id=service_type_int)
            except (ValueError, TypeError):
                qs = qs.filter(category__name__icontains=service_type)
        
        if q:
            qs = qs.filter(
                Q(title__icontains=q) | 
                Q(description__icontains=q) |
                Q(category__name__icontains=q)
            )
        
        # Add a default distance for fallback results
        from django.db.models import Value, FloatField
        qs = qs.annotate(distance_km=Value(radius_km + 1, output_field=FloatField()))
        qs = qs.order_by('-rating_avg', 'id')[:max_results]
    
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


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_service_for_worker(request):
    """
    Create a service for a worker automatically based on their profile
    """
    from accounts.models import User
    
    worker_id = request.data.get('worker_id')
    if not worker_id:
        return Response({"error": "worker_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        worker = User.objects.get(id=worker_id, role='worker')
    except User.DoesNotExist:
        return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if worker already has services
    existing_services = Service.objects.filter(provider=worker, is_deleted=False)
    if existing_services.exists():
        # Return the first existing service
        service = existing_services.first()
        serializer = ServiceDetailSerializer(service)
        return Response({
            "message": "Service already exists",
            "service": serializer.data
        })
    
    # Create a service for this worker
    try:
        worker_profile = worker.worker_profile
        
        # Get or create appropriate category
        category_name = 'خدمات عامة'
        if worker_profile.job_title:
            if 'كهربائي' in worker_profile.job_title or 'electrical' in worker_profile.job_title.lower():
                category_name = 'Electricians'
            elif 'سباك' in worker_profile.job_title or 'plumb' in worker_profile.job_title.lower():
                category_name = 'Plumbers'
            elif 'نظافة' in worker_profile.job_title or 'clean' in worker_profile.job_title.lower():
                category_name = 'تنظيف'
        
        category, created = ServiceCategory.objects.get_or_create(
            name=category_name,
            defaults={'is_deleted': False}
        )
        
        # Create the service
        service = Service.objects.create(
            provider=worker,
            category=category,
            title=f'{worker_profile.job_title or "خدمات عامة"} - {worker.username}',
            description=f'خدمات {worker_profile.job_title or "متنوعة"}: {worker_profile.skills or "خدمات عامة"}',
            price=worker_profile.hourly_rate or 100.00,
            is_active=True,
            is_deleted=False
        )
        
        serializer = ServiceDetailSerializer(service)
        return Response({
            "message": "Service created successfully",
            "service": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            "error": f"Failed to create service: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_service_for_worker(request):
    """
    Create a service for a worker automatically based on their profile
    """
    from accounts.models import User
    
    worker_id = request.data.get('worker_id')
    if not worker_id:
        return Response({"error": "worker_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        worker = User.objects.get(id=worker_id, role='worker')
    except User.DoesNotExist:
        return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if worker already has services
    existing_services = Service.objects.filter(provider=worker, is_deleted=False)
    if existing_services.exists():
        # Return the first existing service
        service = existing_services.first()
        serializer = ServiceDetailSerializer(service)
        return Response({
            "message": "Service already exists",
            "service": serializer.data
        })
    
    # Create a service for this worker
    try:
        worker_profile = worker.worker_profile
        
        # Get or create appropriate category
        category_name = 'خدمات عامة'
        if worker_profile.job_title:
            if 'كهربائي' in worker_profile.job_title or 'electrical' in worker_profile.job_title.lower():
                category_name = 'Electricians'
            elif 'سباك' in worker_profile.job_title or 'plumb' in worker_profile.job_title.lower():
                category_name = 'Plumbers'
            elif 'نظافة' in worker_profile.job_title or 'clean' in worker_profile.job_title.lower():
                category_name = 'تنظيف'
        
        category, created = ServiceCategory.objects.get_or_create(
            name=category_name,
            defaults={'is_deleted': False}
        )
        
        # Create the service
        service = Service.objects.create(
            provider=worker,
            category=category,
            title=f'{worker_profile.job_title or "خدمات عامة"} - {worker.username}',
            description=f'خدمات {worker_profile.job_title or "متنوعة"}: {worker_profile.skills or "خدمات عامة"}',
            price=worker_profile.hourly_rate or 100.00,
            is_active=True,
            is_deleted=False
        )
        
        serializer = ServiceDetailSerializer(service)
        return Response({
            "message": "Service created successfully",
            "service": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            "error": f"Failed to create service: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
