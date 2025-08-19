from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Rating
from .serializers import RatingSerializer
from orders.models import Order

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_rating(request, order_id):
    """
    Client creates a rating for a completed order
    """
    order = get_object_or_404(Order, pk=order_id, is_deleted=False)

    if request.user != order.client:
        return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
    
    if order.status != "completed":
        return Response({"error": "Order must be completed to rate"}, status=status.HTTP_400_BAD_REQUEST)
    
    if hasattr(order, "rating"):
        return Response({"error": "Rating already exists for this order"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = RatingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(client=request.user, order=order, service=order.service)
        return Response({"message": "Rating created", "rating": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def service_ratings(request, service_id):
    """
    List all ratings for a service (excluding deleted)
    """
    ratings = Rating.objects.filter(service_id=service_id, is_deleted=False)
    serializer = RatingSerializer(ratings, many=True)
    return Response(serializer.data)
