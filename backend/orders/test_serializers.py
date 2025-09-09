"""
Unit Tests for Orders Serializers
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal

from .models import Order, Offer, Negotiation
from .serializers import OrderSerializer, OfferSerializer, NegotiationSerializer
from services.models import Service

User = get_user_model()


class OrderSerializerTest(TestCase):
    """Test OrderSerializer functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client_user = User.objects.create_user(
            username='client', email='client@test.com', password='pass', role='client'
        )
        self.worker_user = User.objects.create_user(
            username='worker', email='worker@test.com', password='pass', role='worker'
        )
        
        self.service = Service.objects.create(
            name='Test Service',
            title='Test Service Title',  # Assuming title field exists
            price=Decimal('100.00'),
            provider=self.worker_user
        )
        
        self.order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            description='Test order',
            offered_price=Decimal('80.00')
        )
    
    def test_order_serialization(self):
        """Test order serialization"""
        serializer = OrderSerializer(self.order)
        data = serializer.data
        
        self.assertEqual(data['id'], self.order.id)
        self.assertEqual(data['description'], 'Test order')
        self.assertEqual(Decimal(data['offered_price']), Decimal('80.00'))
        self.assertEqual(data['customer_name'], 'client')
        self.assertEqual(data['status'], 'pending')
    
    def test_order_deserialization(self):
        """Test order deserialization"""
        data = {
            'service': self.service.id,
            'description': 'New test order',
            'offered_price': '90.00',
            'location_lat': 24.7136,
            'location_lng': 46.6753,
            'status': 'pending'
        }
        
        serializer = OrderSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        order = serializer.save(customer=self.client_user)
        self.assertEqual(order.description, 'New test order')
        self.assertEqual(order.offered_price, Decimal('90.00'))
        self.assertEqual(order.customer, self.client_user)
    
    def test_order_serializer_read_only_fields(self):
        """Test read-only fields in OrderSerializer"""
        data = {
            'service': self.service.id,
            'description': 'Test order',
            'customer': 999,  # This should be ignored (read-only)
            'date_created': '2023-01-01T00:00:00Z'  # This should be ignored (read-only)
        }
        
        serializer = OrderSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        order = serializer.save(customer=self.client_user)
        self.assertEqual(order.customer, self.client_user)  # Should use the passed customer, not 999
    
    def test_order_serializer_invalid_data(self):
        """Test OrderSerializer with invalid data"""
        data = {
            'service': 999,  # Non-existent service
            'description': '',
            'offered_price': 'invalid_price'
        }
        
        serializer = OrderSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('service', serializer.errors)
        self.assertIn('offered_price', serializer.errors)


class OfferSerializerTest(TestCase):
    """Test OfferSerializer functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client_user = User.objects.create_user(
            username='client', email='client@test.com', password='pass', role='client'
        )
        self.worker_user = User.objects.create_user(
            username='worker', email='worker@test.com', password='pass', role='worker'
        )
        
        self.service = Service.objects.create(
            name='Test Service', price=Decimal('100.00'), provider=self.worker_user
        )
        
        self.order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            offered_price=Decimal('80.00')
        )
        
        self.offer = Offer.objects.create(
            order=self.order,
            provider=self.worker_user,
            proposed_price=Decimal('90.00')
        )
    
    def test_offer_serialization(self):
        """Test offer serialization"""
        serializer = OfferSerializer(self.offer)
        data = serializer.data
        
        self.assertEqual(data['id'], self.offer.id)
        self.assertEqual(Decimal(data['proposed_price']), Decimal('90.00'))
        self.assertEqual(data['provider_name'], 'worker')
        self.assertFalse(data['accepted'])
    
    def test_offer_deserialization(self):
        """Test offer deserialization"""
        data = {
            'proposed_price': '95.00',
            'accepted': False
        }
        
        serializer = OfferSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        offer = serializer.save(order=self.order, provider=self.worker_user)
        self.assertEqual(offer.proposed_price, Decimal('95.00'))
        self.assertEqual(offer.order, self.order)
        self.assertEqual(offer.provider, self.worker_user)
    
    def test_offer_serializer_invalid_data(self):
        """Test OfferSerializer with invalid data"""
        data = {
            'proposed_price': 'invalid_price',
            'accepted': 'not_boolean'
        }
        
        serializer = OfferSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('proposed_price', serializer.errors)


class NegotiationSerializerTest(TestCase):
    """Test NegotiationSerializer functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client_user = User.objects.create_user(
            username='client', email='client@test.com', password='pass', role='client'
        )
        self.worker_user = User.objects.create_user(
            username='worker', email='worker@test.com', password='pass', role='worker'
        )
        
        self.service = Service.objects.create(
            name='Test Service', price=Decimal('100.00'), provider=self.worker_user
        )
        
        self.order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            offered_price=Decimal('80.00')
        )
        
        self.negotiation = Negotiation.objects.create(
            order=self.order,
            sender=self.client_user,
            message='Can you do it for 75?',
            proposed_price=Decimal('75.00')
        )
    
    def test_negotiation_serialization(self):
        """Test negotiation serialization"""
        serializer = NegotiationSerializer(self.negotiation)
        data = serializer.data
        
        self.assertEqual(data['id'], self.negotiation.id)
        self.assertEqual(data['message'], 'Can you do it for 75?')
        self.assertEqual(Decimal(data['proposed_price']), Decimal('75.00'))
        self.assertEqual(data['sender_name'], 'client')
    
    def test_negotiation_deserialization(self):
        """Test negotiation deserialization"""
        data = {
            'message': 'How about 85?',
            'proposed_price': '85.00'
        }
        
        serializer = NegotiationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        negotiation = serializer.save(order=self.order, sender=self.worker_user)
        self.assertEqual(negotiation.message, 'How about 85?')
        self.assertEqual(negotiation.proposed_price, Decimal('85.00'))
        self.assertEqual(negotiation.order, self.order)
        self.assertEqual(negotiation.sender, self.worker_user)
    
    def test_negotiation_without_proposed_price(self):
        """Test negotiation serialization without proposed price"""
        data = {
            'message': 'I can do it tomorrow'
        }
        
        serializer = NegotiationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        negotiation = serializer.save(order=self.order, sender=self.worker_user)
        self.assertEqual(negotiation.message, 'I can do it tomorrow')
        self.assertIsNone(negotiation.proposed_price)
    
    def test_negotiation_serializer_invalid_data(self):
        """Test NegotiationSerializer with invalid data"""
        data = {
            'message': '',  # Empty message
            'proposed_price': 'invalid_price'
        }
        
        serializer = NegotiationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('message', serializer.errors)
        self.assertIn('proposed_price', serializer.errors)


class SerializerIntegrationTest(TestCase):
    """Test serializers working together"""
    
    def setUp(self):
        """Set up test data"""
        self.client_user = User.objects.create_user(
            username='client', email='client@test.com', password='pass', role='client'
        )
        self.worker_user = User.objects.create_user(
            username='worker', email='worker@test.com', password='pass', role='worker'
        )
        
        self.service = Service.objects.create(
            name='Test Service', price=Decimal('100.00'), provider=self.worker_user
        )
    
    def test_full_order_workflow_serialization(self):
        """Test full workflow: Order -> Offer -> Negotiation"""
        # 1. Create order
        order_data = {
            'service': self.service.id,
            'description': 'Need electrical work',
            'offered_price': '80.00'
        }
        
        order_serializer = OrderSerializer(data=order_data)
        self.assertTrue(order_serializer.is_valid())
        order = order_serializer.save(customer=self.client_user)
        
        # 2. Create offer
        offer_data = {
            'proposed_price': '90.00'
        }
        
        offer_serializer = OfferSerializer(data=offer_data)
        self.assertTrue(offer_serializer.is_valid())
        offer = offer_serializer.save(order=order, provider=self.worker_user)
        
        # 3. Create negotiation
        negotiation_data = {
            'message': 'Can we meet at 85?',
            'proposed_price': '85.00'
        }
        
        negotiation_serializer = NegotiationSerializer(data=negotiation_data)
        self.assertTrue(negotiation_serializer.is_valid())
        negotiation = negotiation_serializer.save(order=order, sender=self.client_user)
        
        # Verify relationships
        self.assertEqual(offer.order, order)
        self.assertEqual(negotiation.order, order)
        self.assertEqual(order.offers.first(), offer)
        self.assertEqual(order.negotiations.first(), negotiation)


