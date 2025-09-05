from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Order, Offer, Negotiation
from .serializers import OrderSerializer, OfferSerializer, NegotiationSerializer

# ---------------- Orders ----------------
@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def order_list(request):
    """
    GET: List all orders of the current user (client) or all if admin
    POST: Create a new order
    """
    if request.method == "GET":
        if request.user.is_staff:
            orders = Order.objects.filter(is_deleted=False)
        else:
            orders = Order.objects.filter(customer=request.user, is_deleted=False)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        # Check if user has the right role to create orders
        if hasattr(request.user, 'role') and request.user.role == 'worker':
            return Response(
                {"error": "Workers cannot create orders. They can only make offers."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(customer=request.user)
            return Response(
                {"message": "Order created", "order": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def order_detail(request, pk):
    order = get_object_or_404(Order, pk=pk, is_deleted=False)

    # GET
    if request.method == "GET":
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    # PUT
    elif request.method == "PUT":
        if request.user != order.customer:
            return Response(
                {"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN
            )
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Order updated", "order": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE (soft delete)
    elif request.method == "DELETE":
        if request.user != order.customer:
            return Response(
                {"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN
            )
        order.is_deleted = True
        order.save()
        return Response(
            {"message": "Order soft deleted"}, status=status.HTTP_200_OK
        )


# ---------------- Offers ----------------
@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def offer_list(request, order_id):
    """
    GET: List offers for a specific order
    POST: Provider sends an offer
    """
    order = get_object_or_404(Order, pk=order_id, is_deleted=False)

    if request.method == "GET":
        offers = order.offers.all()
        serializer = OfferSerializer(offers, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        if request.user == order.customer:
            return Response(
                {"error": "Client cannot make offers on own order"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = OfferSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(provider=request.user, order=order)
            return Response(
                {"message": "Offer created", "offer": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------- Negotiations ----------------
@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def negotiation_list(request, order_id):
    """
    GET: List negotiations for an order
    POST: Send a negotiation message
    """
    order = get_object_or_404(Order, pk=order_id, is_deleted=False)

    if request.method == "GET":
        negotiations = order.negotiations.all()
        serializer = NegotiationSerializer(negotiations, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        if request.user != order.customer and not order.offers.filter(
            provider=request.user
        ).exists():
            return Response(
                {"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN
            )
        serializer = NegotiationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user, order=order)
            return Response(
                {"message": "Negotiation sent", "negotiation": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
