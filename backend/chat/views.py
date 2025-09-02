from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Message
from .serializers import MessageSerializer

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])  
def message_list_create(request):
    if request.method == "GET":
        user1 = request.query_params.get("user1")
        user2 = request.query_params.get("user2")

        if user1 and user2:
            messages = Message.objects.filter(
                sender_id__in=[user1, user2],
                receiver_id__in=[user1, user2]
            ).order_by("timestamp")  
        else:
            return Response({"detail": "user1 and user2 are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
