from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Review
from services.models import Service
from .serializers import ReviewSerializer

# -------- Reviews for a Service --------
@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def service_reviews(request, service_id):
    service = get_object_or_404(Service, pk=service_id)

    if request.method == "GET":
        reviews = service.reviews.filter(is_deleted=False)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(client=request.user, service=service)
            return Response({"message": "Review created", "review": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------- Single Review CRUD --------
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def review_detail(request, pk):
    review = get_object_or_404(Review, pk=pk, is_deleted=False)

    if request.method == "GET":
        serializer = ReviewSerializer(review)
        return Response(serializer.data)

    elif request.method == "PUT":
        if request.user != review.client:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ReviewSerializer(review, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Review updated", "review": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        if request.user != review.client:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        review.is_deleted = True
        review.save()
        return Response({"message": "Review soft deleted"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)