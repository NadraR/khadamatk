import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from orders.models import Order

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        self.user = self.scope["user"]
        self.room_group_name = f'chat_{self.order_id}'

        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        try:
            order = await self.get_order(self.order_id)
            if not await self.user_can_access_order(self.user, order):
                await self.close(code=4003)
                return
        except Order.DoesNotExist:
            await self.close(code=4004)
            return

        # Join chat room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave chat room
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message', '').strip()
            
            # Validate message
            if not message:
                await self.send(text_data=json.dumps({
                    'error': 'Message cannot be empty'
                }))
                return
            
            if len(message) > 1000:  # Limit message length
                await self.send(text_data=json.dumps({
                    'error': 'Message too long (max 1000 characters)'
                }))
                return

            # Save and broadcast message
            msg = await self.save_message(self.user.id, self.order_id, message)

            # Broadcast to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': msg["message"],
                    'username': msg["username"],
                    'timestamp': msg["timestamp"]
                }
            )
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': 'Failed to send message'
            }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def get_order(self, order_id):
        return Order.objects.get(id=order_id)

    @database_sync_to_async
    def user_can_access_order(self, user, order):
        """Check if user can access this order (client or worker)"""
        return (user == order.client or user == order.worker or user.is_staff)

    @database_sync_to_async
    def save_message(self, sender_id, order_id, message):
        try:
            sender = User.objects.get(id=sender_id)
            order = Order.objects.get(id=order_id)
            conversation, _ = Conversation.objects.get_or_create(order=order)

            msg = Message.objects.create(
                conversation=conversation,
                sender=sender,
                message=message
            )
            return {
                "message": msg.message,
                "username": sender.username,
                "timestamp": msg.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            }
        except Exception as e:
            raise Exception(f"Failed to save message: {str(e)}")
