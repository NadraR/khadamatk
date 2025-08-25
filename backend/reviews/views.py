from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer
from orders.models import Order
from services.models import Service
from rest_framework.permissions import IsAuthenticated

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def service_reviews(request, service_id):
    if request.method == "GET":
        reviews = Review.objects.filter(service_id=service_id, is_deleted=False)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        service = Service.objects.get(pk=service_id)
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(customer=request.user, service=service)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        service = order.service
    else:
        service_id = request.data.get("service")
        if not service_id:
            return Response({"error": "Service is required"}, status=status.HTTP_400_BAD_REQUEST)
        service = get_object_or_404(Service, pk=service_id, is_deleted=False)

    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(customer=request.user, service=service, order=order)
        return Response({"message": "Review created", "review": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def review_detail(request, review_id):
    review = get_object_or_404(Review, pk=review_id, is_deleted=False)

    if request.method == "GET":
        serializer = ReviewSerializer(review)
        return Response(serializer.data)

    elif request.method == "PUT":
        if request.user != review.customer:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        if request.user != review.customer:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        review.is_deleted = True
        review.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
