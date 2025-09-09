from django.shortcuts import get_object_or_404
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Order, Offer, Negotiation
from .serializers import OrderSerializer, OfferSerializer, NegotiationSerializer
from notifications.models import Notification
from invoices.models import Invoice
from django.contrib.contenttypes.models import ContentType

# Helper function for creating notifications
def create_notification(recipient, actor, verb, message, short_message, level='info', **kwargs):
    """Create a notification with proper Generic Foreign Key handling"""
    try:
        recipient_content_type = ContentType.objects.get_for_model(recipient)
        
        notification_data = {
            'recipient_content_type': recipient_content_type,
            'recipient_object_id': recipient.id,
            'actor': actor,
            'verb': verb,
            'message': message,
            'short_message': short_message,
            'level': level,
        }
        
        # Add any additional fields
        notification_data.update(kwargs)
        
        return Notification.objects.create(**notification_data)
    except Exception as e:
        print(f"Error creating notification: {e}")
        return None

# ---------------- Orders ----------------
@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def order_list(request):
    """
    GET: List all orders of the current user (client) or all if admin
         If worker_only=true, show all pending orders for workers
    POST: Create a new order
    """
    if request.method == "GET":
        # Check if this is a worker requesting orders to work on
        worker_only = request.GET.get('worker_only', 'false').lower() == 'true'
        
        if worker_only and hasattr(request.user, 'role') and request.user.role == 'worker':
            # For workers: show orders assigned to them + orders for their services
            orders = Order.objects.filter(
                models.Q(worker=request.user) | models.Q(service__provider=request.user),
                is_deleted=False
            ).select_related('customer', 'service').order_by('-created_at')
        elif request.user.is_staff:
            orders = Order.objects.filter(is_deleted=False).select_related('customer', 'service')
        else:
            # For clients: show their own orders
            orders = Order.objects.filter(customer=request.user, is_deleted=False).select_related('service')
        
        # Apply status filter if provided
        status_filter = request.GET.get('status')
        if status_filter and status_filter != 'all':
            orders = orders.filter(status=status_filter)
        
        # Apply pagination
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = orders.count()
        orders_page = orders[start:end]
        
        serializer = OrderSerializer(orders_page, many=True)
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })

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

# ---------------- Order Actions (Accept/Decline) ----------------
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_order(request, pk):
    """
    Worker accepts an order
    """
    try:
        # Get order with detailed error handling
        try:
            order = get_object_or_404(Order, pk=pk, is_deleted=False)
        except Exception as e:
            return Response(
                {"error": f"Order not found: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Check if user is a worker
        if not hasattr(request.user, 'role') or request.user.role != 'worker':
            return Response(
                {"error": "Only workers can accept orders", "details": "User role is not worker"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if order can be accepted
        if order.status not in ['pending']:
            return Response(
                {
                    "error": f"Cannot accept order with status: {order.status}", 
                    "details": "Order must be in 'pending' status to be accepted",
                    "current_status": order.status
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Check if order already has a worker assigned
        if order.worker and order.worker != request.user:
            return Response(
                {
                    "error": "Order already assigned to another worker",
                    "details": f"Order is already assigned to {order.worker.username}",
                    "assigned_worker": order.worker.username
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update order status
        try:
            order.status = 'accepted'
            order.worker = request.user  # Assign worker to order
            order.save()
        except Exception as e:
            return Response(
                {"error": f"Failed to update order: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        # Create notification for customer
        try:
            create_notification(
                recipient=order.customer,
                actor=request.user,
                verb='order_accepted',
                message=f'تم قبول طلبك #{order.id} من قبل {request.user.username}',
                short_message=f'تم قبول الطلب #{order.id}',
                level='success',
                requires_action=False,
                offered_price=order.offered_price,
                service_name=order.service.title if order.service else 'خدمة غير محددة',
                job_description=order.description or 'طلب جديد',
                location_lat=order.location_lat,
                location_lng=order.location_lng,
                location_address=order.location_address or 'عنوان غير محدد',
                url=f'/track-order'
            )
        except Exception as e:
            # Log notification error but don't fail the request
            print(f"Warning: Failed to create notification: {e}")
        
        # Serialize response
        try:
            serializer = OrderSerializer(order)
            return Response({
                "message": "Order accepted successfully",
                "order": serializer.data,
                "success": True
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to serialize order data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
    except Exception as e:
        return Response(
            {
                "error": "Internal server error occurred while accepting order",
                "details": str(e),
                "success": False
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def complete_order(request, pk):
    """
    Client marks an order as completed (approve completion)
    This will trigger automatic invoice creation via signals
    """
    try:
        order = get_object_or_404(Order, pk=pk, is_deleted=False)
        
        # Check if user is the customer
        if request.user != order.customer:
            return Response(
                {"error": "Only the customer can mark an order as completed"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if order can be completed
        if order.status not in ['in_progress', 'accepted']:
            return Response(
                {"error": f"Cannot complete order with status: {order.status}. Order must be in progress or accepted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update order status
        order.status = 'completed'
        order.save()
        
        # Create notification for worker
        Notification.objects.create(
            recipient=order.worker or order.service.provider,
            verb='order_completed',
            message=f'تم تأكيد اكتمال الطلب #{order.id} من قبل العميل {request.user.username}',
            short_message=f'تم تأكيد اكتمال الطلب #{order.id}',
            level='success',
            requires_action=False,
            # Add order details to notification
            offered_price=order.offered_price,
            service_name=order.service.title if order.service else 'خدمة غير محددة',
            job_description=order.description or 'طلب مكتمل',
            location_lat=order.location_lat,
            location_lng=order.location_lng,
            location_address=order.location_address,
            url=f'/orders/{order.id}'
        )
        
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order completed successfully. Invoice will be created automatically.",
            "order": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def approve_completion(request, pk):
    """
    Client approves order completion (confirms the work is done)
    This will trigger automatic invoice creation via signals
    """
    try:
        order = get_object_or_404(Order, pk=pk, is_deleted=False)
        
        # Check if user is the customer
        if request.user != order.customer:
            return Response(
                {"error": "Only the customer can approve order completion"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if order can be approved
        if order.status != 'completed':
            return Response(
                {"error": f"Cannot approve order with status: {order.status}. Order must be completed by worker first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update order status to approved_completed
        order.status = 'approved_completed'
        order.save()
        
        # Create notification for worker
        try:
            create_notification(
                recipient=order.worker or order.service.provider,
                actor=request.user,
                verb='order_approved',
                message=f'وافق العميل {request.user.username} على اكتمال الطلب #{order.id}. سيتم إنشاء الفاتورة تلقائياً.',
                short_message=f'تم الموافقة على الطلب #{order.id}',
                target=order,
                url=f'/orders/{order.id}',
                level='success',
                offered_price=order.offered_price,
                service_name=order.service.title if order.service else 'خدمة غير محددة',
                job_description=order.description or 'طلب مكتمل',
                location_lat=order.location_lat,
                location_lng=order.location_lng,
                location_address=order.location_address,
                requires_action=False
            )
        except Exception as e:
            print(f"Error creating notification: {e}")
        
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order completion approved successfully. Invoice will be created automatically.",
            "order": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def decline_order(request, pk):
    """
    Worker declines an order
    """
    try:
        order = get_object_or_404(Order, pk=pk, is_deleted=False)
        
        # Check if user is a worker
        if not hasattr(request.user, 'role') or request.user.role != 'worker':
            return Response(
                {"error": "Only workers can decline orders"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if order can be declined
        if order.status not in ['pending', 'accepted']:
            return Response(
                {"error": f"Cannot decline order with status: {order.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Get decline reason from request (optional)
        decline_reason = request.data.get('reason', 'لم يتم تحديد السبب')
        
        # Update order status
        order.status = 'declined'
        order.decline_reason = decline_reason
        order.save()
        
        # Create notification for customer
        try:
            create_notification(
                recipient=order.customer,
                actor=request.user,
                verb='order_declined',
                message=f'تم رفض طلبك #{order.id} من قبل {request.user.username}. السبب: {decline_reason}',
                short_message=f'تم رفض الطلب #{order.id}',
                level='warning',
                requires_action=False,
                offered_price=order.offered_price,
                service_name=order.service.title if order.service else 'خدمة غير محددة',
                job_description=order.description or 'طلب مرفوض',
                location_lat=order.location_lat,
                location_lng=order.location_lng,
                location_address=order.location_address or 'عنوان غير محدد',
                url=f'/track-order'
            )
        except Exception as e:
            print(f"Warning: Failed to create decline notification: {e}")
        
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order declined successfully",
            "order": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def approve_completion(request, pk):
    """
    Client approves order completion (confirms the work is done)
    This will trigger automatic invoice creation via signals
    """
    try:
        order = get_object_or_404(Order, pk=pk, is_deleted=False)
        
        # Check if user is the customer
        if request.user != order.customer:
            return Response(
                {"error": "Only the customer can approve order completion"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if order can be approved
        if order.status != 'completed':
            return Response(
                {"error": f"Cannot approve order with status: {order.status}. Order must be completed by worker first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update order status to approved_completed
        order.status = 'approved_completed'
        order.save()
        
        # Create notification for worker
        try:
            create_notification(
                recipient=order.worker or order.service.provider,
                actor=request.user,
                verb='order_approved',
                message=f'وافق العميل {request.user.username} على اكتمال الطلب #{order.id}. سيتم إنشاء الفاتورة تلقائياً.',
                short_message=f'تم الموافقة على الطلب #{order.id}',
                target=order,
                url=f'/orders/{order.id}',
                level='success',
                offered_price=order.offered_price,
                service_name=order.service.title if order.service else 'خدمة غير محددة',
                job_description=order.description or 'طلب مكتمل',
                location_lat=order.location_lat,
                location_lng=order.location_lng,
                location_address=order.location_address,
                requires_action=False
            )
        except Exception as e:
            print(f"Error creating notification: {e}")
        
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order completion approved successfully. Invoice will be created automatically.",
            "order": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def start_order(request, pk):
    """
    Worker starts working on an order (changes status from accepted to in_progress)
    """
    try:
        order = get_object_or_404(Order, pk=pk, is_deleted=False)
        
        # Check if user is a worker
        if not hasattr(request.user, 'role') or request.user.role != 'worker':
            return Response(
                {"error": "Only workers can start orders"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if user is the assigned worker
        if order.worker != request.user:
            return Response(
                {"error": "Only the assigned worker can start this order"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if order can be started
        if order.status not in ['accepted']:
            return Response(
                {
                    "error": f"Cannot start order with status: {order.status}",
                    "details": "Order must be in 'accepted' status to be started",
                    "current_status": order.status
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update order status
        order.status = 'in_progress'
        order.save()
        
        # Create notification for customer
        try:
            create_notification(
                recipient=order.customer,
                actor=request.user,
                verb='order_started',
                message=f'بدأ العامل {request.user.username} العمل على طلبك #{order.id}',
                short_message=f'بدأ العمل على الطلب #{order.id}',
                target=order,
                url=f'/orders/{order.id}',
                level='info',
                offered_price=order.offered_price,
                service_name=order.service.title if order.service else 'خدمة غير محددة',
                job_description=order.description or 'طلب قيد التنفيذ',
                location_lat=order.location_lat,
                location_lng=order.location_lng,
                location_address=order.location_address,
                requires_action=False
            )
        except Exception as e:
            print(f"Error creating notification: {e}")
        
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order started successfully",
            "order": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def approve_completion(request, pk):
    """
    Client approves order completion (confirms the work is done)
    This will trigger automatic invoice creation via signals
    """
    try:
        order = get_object_or_404(Order, pk=pk, is_deleted=False)
        
        # Check if user is the customer
        if request.user != order.customer:
            return Response(
                {"error": "Only the customer can approve order completion"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if order can be approved
        if order.status != 'completed':
            return Response(
                {"error": f"Cannot approve order with status: {order.status}. Order must be completed by worker first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update order status to approved_completed
        order.status = 'approved_completed'
        order.save()
        
        # Create notification for worker
        try:
            create_notification(
                recipient=order.worker or order.service.provider,
                actor=request.user,
                verb='order_approved',
                message=f'وافق العميل {request.user.username} على اكتمال الطلب #{order.id}. سيتم إنشاء الفاتورة تلقائياً.',
                short_message=f'تم الموافقة على الطلب #{order.id}',
                target=order,
                url=f'/orders/{order.id}',
                level='success',
                offered_price=order.offered_price,
                service_name=order.service.title if order.service else 'خدمة غير محددة',
                job_description=order.description or 'طلب مكتمل',
                location_lat=order.location_lat,
                location_lng=order.location_lng,
                location_address=order.location_address,
                requires_action=False
            )
        except Exception as e:
            print(f"Error creating notification: {e}")
        
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order completion approved successfully. Invoice will be created automatically.",
            "order": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def complete_order(request, pk):
    """
    Client marks an order as completed (approve completion)
    This will trigger automatic invoice creation via signals
    """
    try:
        order = get_object_or_404(Order, pk=pk, is_deleted=False)
        
        # Check if user is the customer
        if request.user != order.customer:
            return Response(
                {"error": "Only the customer can mark an order as completed"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if order can be completed
        if order.status not in ['in_progress', 'accepted']:
            return Response(
                {"error": f"Cannot complete order with status: {order.status}. Order must be in progress or accepted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update order status
        order.status = 'completed'
        order.save()
        
        # Create notification for worker
        Notification.objects.create(
            recipient=order.worker or order.service.provider,
            verb='order_completed',
            message=f'تم تأكيد اكتمال الطلب #{order.id} من قبل العميل {request.user.username}',
            short_message=f'تم تأكيد اكتمال الطلب #{order.id}',
            level='success',
            requires_action=False,
            # Add order details to notification
            offered_price=order.offered_price,
            service_name=order.service.title if order.service else 'خدمة غير محددة',
            job_description=order.description or 'طلب مكتمل',
            location_lat=order.location_lat,
            location_lng=order.location_lng,
            location_address=order.location_address,
            url=f'/orders/{order.id}'
        )
        
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order completed successfully. Invoice will be created automatically.",
            "order": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def approve_completion(request, pk):
    """
    Client approves order completion (confirms the work is done)
    This will trigger automatic invoice creation via signals
    """
    try:
        order = get_object_or_404(Order, pk=pk, is_deleted=False)
        
        # Check if user is the customer
        if request.user != order.customer:
            return Response(
                {"error": "Only the customer can approve order completion"},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Check if order can be approved
        if order.status != 'completed':
            return Response(
                {"error": f"Cannot approve order with status: {order.status}. Order must be completed by worker first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update order status to approved_completed
        order.status = 'approved_completed'
        order.save()
        
        # Create notification for worker
        try:
            create_notification(
                recipient=order.worker or order.service.provider,
                actor=request.user,
                verb='order_approved',
                message=f'وافق العميل {request.user.username} على اكتمال الطلب #{order.id}. سيتم إنشاء الفاتورة تلقائياً.',
                short_message=f'تم الموافقة على الطلب #{order.id}',
                target=order,
                url=f'/orders/{order.id}',
                level='success',
                offered_price=order.offered_price,
                service_name=order.service.title if order.service else 'خدمة غير محددة',
                job_description=order.description or 'طلب مكتمل',
                location_lat=order.location_lat,
                location_lng=order.location_lng,
                location_address=order.location_address,
                requires_action=False
            )
        except Exception as e:
            print(f"Error creating notification: {e}")
        
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order completion approved successfully. Invoice will be created automatically.",
            "order": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


