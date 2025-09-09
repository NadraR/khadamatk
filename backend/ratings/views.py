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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def provider_ratings(request, provider_id):
    """Get rating statistics for a specific provider/worker"""
    from accounts.models import WorkerProfile
    from django.db.models import Avg, Count
    from reviews.models import Review
    
    try:
        worker_profile = WorkerProfile.objects.get(user_id=provider_id)
    except WorkerProfile.DoesNotExist:
        return Response({"error": "Provider not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all services by this provider
    provider_services = Service.objects.filter(provider_id=provider_id, is_active=True)
    service_ids = provider_services.values_list('id', flat=True)
    
    # Get rating statistics for all services
    ratings_stats = Rating.objects.filter(
        service_id__in=service_ids
    ).aggregate(
        average_rating=Avg('score'),
        total_ratings=Count('id')
    )
    
    # Get rating distribution
    rating_distribution = {}
    for score in range(1, 6):
        count = Rating.objects.filter(service_id__in=service_ids, score=score).count()
        rating_distribution[score] = count
    
    # Get recent reviews for this provider
    recent_reviews = Review.objects.filter(
        service_id__in=service_ids,
        is_deleted=False
    ).select_related('service', 'customer').order_by('-created_at')[:5]
    
    recent_reviews_data = []
    for review in recent_reviews:
        recent_reviews_data.append({
            'id': review.id,
            'service_name': review.service.title,
            'customer_name': review.customer.username or review.customer.email,
            'rating': review.rating,
            'comment': review.comment,
            'created_at': review.created_at,
        })
    
    return Response({
        'average_rating': round(ratings_stats['average_rating'] or 0, 2),
        'total_ratings': ratings_stats['total_ratings'] or 0,
        'rating_distribution': rating_distribution,
        'recent_reviews': recent_reviews_data
    })


