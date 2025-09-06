from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Rating
from .serializers import RatingSerializer
from services.models import Service

@api_view(["GET"])
def service_ratings(request, service_id):
    qs = Rating.objects.filter(service_id=service_id).select_related("customer").order_by("-created_at")
    return Response(RatingSerializer(qs, many=True).data)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def add_or_update_rating(request, service_id):
    service = get_object_or_404(Service, pk=service_id)
    score = int(request.data.get("score", 0))
    if score < 1 or score > 5:
        return Response({"error": "Score must be between 1 and 5"}, status=status.HTTP_400_BAD_REQUEST)

    rating, created = Rating.objects.update_or_create(
        service=service, customer=request.user, defaults={"score": score}
    )
    return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_ratings(request):
    """Get all ratings by the current user"""
    ratings = Rating.objects.filter(
        customer=request.user
    ).select_related('service').order_by('-created_at')
    
    ratings_data = []
    for rating in ratings:
        ratings_data.append({
            'id': rating.id,
            'service_name': rating.service.title,
            'service_id': rating.service.id,
            'rating': rating.score,
            'created_at': rating.created_at,
            'updated_at': rating.updated_at,
        })
    
    return Response(ratings_data)
