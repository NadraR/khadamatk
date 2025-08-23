from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer
from orders.models import Order

@api_view(["GET"])
def service_reviews(request, service_id):
    reviews = Review.objects.filter(service_id=service_id, is_deleted=False)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_review(request, order_id=None):
    order = None
    service = None
    if order_id:
        order = get_object_or_404(Order, pk=order_id, is_deleted=False)
        if request.user != order.customer:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        if order.status != "completed":
            return Response({"error": "Order must be completed"}, status=status.HTTP_400_BAD_REQUEST)
        service = order.service
        if Review.objects.filter(order=order, customer=request.user).exists():
            return Response({"error": "Review already exists"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(customer=request.user, service=service, order=order)
        return Response({"message": "Review created", "review": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
