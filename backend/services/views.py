from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Service, ServiceCategory
from .serializers import ServiceSerializer, ServiceDetailSerializer, ServiceCategorySerializer

# -------- Categories --------
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

# -------- Services --------
@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def service_list(request):
    if request.method == "GET":
        services = Service.objects.filter(is_deleted=False).annotate(
            rating_avg=Avg("reviews__rating"),
            rating_count=Count("reviews")
        )

        # فلترة مباشرة
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
            rating_avg=Avg("reviews__rating"),
            rating_count=Count("reviews")
        ),
        pk=pk
    )

    if request.method == "GET":
        serializer = ServiceDetailSerializer(service)
        return Response(serializer.data)

    elif request.method == "PUT":
        # التأكد أن فقط المزود نفسه يستطيع التعديل
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
