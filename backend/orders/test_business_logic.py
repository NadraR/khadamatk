"""
Unit Tests for Orders Business Logic and Edge Cases
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from unittest.mock import patch, MagicMock

from .models import Order, Offer, Negotiation
from services.models import Service

User = get_user_model()


class OrderBusinessLogicTest(TestCase):
    """Test business logic and edge cases"""
    
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
    
    def test_order_with_future_scheduled_time(self):
        """Test order with future scheduled time"""
        future_time = timezone.now() + timedelta(hours=24)
        order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            scheduled_time=future_time
        )
        
        self.assertGreater(order.scheduled_time, timezone.now())
    
    def test_order_with_delivery_time(self):
        """Test order with delivery time"""
        delivery_time = timezone.now() + timedelta(days=2)
        order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            delivery_time=delivery_time
        )
        
        self.assertEqual(order.delivery_time, delivery_time)
    
    def test_multiple_offers_same_order(self):
        """Test multiple offers for the same order"""
        order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            offered_price=Decimal('80.00')
        )
        
        worker2 = User.objects.create_user(
            username='worker2', email='worker2@test.com', password='pass', role='worker'
        )
        
        offer1 = Offer.objects.create(
            order=order,
            provider=self.worker_user,
            proposed_price=Decimal('90.00')
        )
        
        offer2 = Offer.objects.create(
            order=order,
            provider=worker2,
            proposed_price=Decimal('85.00')
        )
        
        self.assertEqual(order.offers.count(), 2)
        self.assertIn(offer1, order.offers.all())
        self.assertIn(offer2, order.offers.all())
    
    def test_order_status_transitions(self):
        """Test valid order status transitions"""
        order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            status='pending'
        )
        
        # Test valid transitions
        order.status = 'accepted'
        order.save()
        self.assertEqual(order.status, 'accepted')
        
        order.status = 'completed'
        order.save()
        self.assertEqual(order.status, 'completed')
        
        # Test cancellation from any status
        order.status = 'cancelled'
        order.save()
        self.assertEqual(order.status, 'cancelled')
    
    def test_order_location_coordinates_precision(self):
        """Test location coordinates precision"""
        order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            location_lat=24.713552,
            location_lng=46.675296
        )
        
        # Check precision is maintained
        self.assertAlmostEqual(float(order.location_lat), 24.713552, places=6)
        self.assertAlmostEqual(float(order.location_lng), 46.675296, places=6)


class OrderSignalTest(TestCase):
    """Test Order signals"""
    
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
    
    @patch('orders.signals.get_channel_layer')
    def test_close_chat_on_order_complete(self, mock_get_channel_layer):
        """Test chat closure signal when order is completed"""
        # Mock channel layer
        mock_channel_layer = MagicMock()
        mock_get_channel_layer.return_value = mock_channel_layer
        
        # Change order status to completed
        self.order.status = 'completed'
        self.order.save()
        
        # Verify signal was triggered
        mock_get_channel_layer.assert_called_once()
    
    @patch('orders.signals.get_channel_layer')
    def test_close_chat_on_order_cancelled(self, mock_get_channel_layer):
        """Test chat closure signal when order is cancelled"""
        # Mock channel layer
        mock_channel_layer = MagicMock()
        mock_get_channel_layer.return_value = mock_channel_layer
        
        # Change order status to cancelled
        self.order.status = 'cancelled'
        self.order.save()
        
        # Verify signal was triggered
        mock_get_channel_layer.assert_called_once()


class OrderValidationTest(TestCase):
    """Test order validation and constraints"""
    
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
    
    def test_order_with_negative_price(self):
        """Test order with negative offered price"""
        order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            offered_price=Decimal('-10.00')
        )
        
        # Model allows negative prices, validation should be in serializer/form
        self.assertEqual(order.offered_price, Decimal('-10.00'))
    
    def test_order_without_offered_price(self):
        """Test order without offered price"""
        order = Order.objects.create(
            customer=self.client_user,
            service=self.service
        )
        
        self.assertIsNone(order.offered_price)
    
    def test_order_with_very_large_price(self):
        """Test order with very large price"""
        large_price = Decimal('99999999.99')  # Max for DecimalField(10,2)
        order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            offered_price=large_price
        )
        
        self.assertEqual(order.offered_price, large_price)
    
    def test_order_with_zero_price(self):
        """Test order with zero offered price"""
        order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            offered_price=Decimal('0.00')
        )
        
        self.assertEqual(order.offered_price, Decimal('0.00'))


class OrderQueryTest(TestCase):
    """Test order queries and filtering"""
    
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
        
        # Create multiple orders with different statuses
        self.pending_order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            status='pending'
        )
        
        self.accepted_order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            status='accepted'
        )
        
        self.completed_order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            status='completed'
        )
        
        self.deleted_order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            is_deleted=True
        )
    
    def test_filter_orders_by_status(self):
        """Test filtering orders by status"""
        pending_orders = Order.objects.filter(status='pending')
        self.assertEqual(pending_orders.count(), 1)
        self.assertEqual(pending_orders.first(), self.pending_order)
        
        completed_orders = Order.objects.filter(status='completed')
        self.assertEqual(completed_orders.count(), 1)
        self.assertEqual(completed_orders.first(), self.completed_order)
    
    def test_filter_active_orders(self):
        """Test filtering active (non-deleted) orders"""
        active_orders = Order.objects.filter(is_deleted=False)
        self.assertEqual(active_orders.count(), 3)
        self.assertNotIn(self.deleted_order, active_orders)
    
    def test_filter_orders_by_customer(self):
        """Test filtering orders by customer"""
        customer_orders = Order.objects.filter(customer=self.client_user)
        self.assertEqual(customer_orders.count(), 4)  # Including deleted one
        
        # Create order for different customer
        other_client = User.objects.create_user(
            username='other_client', email='other@test.com', password='pass', role='client'
        )
        
        Order.objects.create(
            customer=other_client,
            service=self.service
        )
        
        # Should still be 4 for original customer
        customer_orders = Order.objects.filter(customer=self.client_user)
        self.assertEqual(customer_orders.count(), 4)
    
    def test_order_with_offers_query(self):
        """Test querying orders with offers"""
        # Create offer for one order
        Offer.objects.create(
            order=self.pending_order,
            provider=self.worker_user,
            proposed_price=Decimal('90.00')
        )
        
        orders_with_offers = Order.objects.filter(offers__isnull=False).distinct()
        self.assertEqual(orders_with_offers.count(), 1)
        self.assertEqual(orders_with_offers.first(), self.pending_order)
    
    def test_order_with_negotiations_query(self):
        """Test querying orders with negotiations"""
        # Create negotiation for one order
        Negotiation.objects.create(
            order=self.accepted_order,
            sender=self.client_user,
            message='Test negotiation'
        )
        
        orders_with_negotiations = Order.objects.filter(negotiations__isnull=False).distinct()
        self.assertEqual(orders_with_negotiations.count(), 1)
        self.assertEqual(orders_with_negotiations.first(), self.accepted_order)


class OfferBusinessLogicTest(TestCase):
    """Test offer business logic"""
    
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
    
    def test_offer_acceptance_logic(self):
        """Test offer acceptance business logic"""
        offer = Offer.objects.create(
            order=self.order,
            provider=self.worker_user,
            proposed_price=Decimal('90.00')
        )
        
        # Initially not accepted
        self.assertFalse(offer.accepted)
        
        # Accept offer
        offer.accepted = True
        offer.save()
        
        self.assertTrue(offer.accepted)
    
    def test_multiple_offers_acceptance(self):
        """Test multiple offers can be accepted (business rule)"""
        worker2 = User.objects.create_user(
            username='worker2', email='worker2@test.com', password='pass', role='worker'
        )
        
        offer1 = Offer.objects.create(
            order=self.order,
            provider=self.worker_user,
            proposed_price=Decimal('90.00')
        )
        
        offer2 = Offer.objects.create(
            order=self.order,
            provider=worker2,
            proposed_price=Decimal('85.00')
        )
        
        # Both can be accepted (current model allows this)
        offer1.accepted = True
        offer1.save()
        
        offer2.accepted = True
        offer2.save()
        
        accepted_offers = self.order.offers.filter(accepted=True)
        self.assertEqual(accepted_offers.count(), 2)
    
    def test_offer_price_comparison(self):
        """Test offer price comparison with order price"""
        offer_higher = Offer.objects.create(
            order=self.order,
            provider=self.worker_user,
            proposed_price=Decimal('90.00')  # Higher than order's 80.00
        )
        
        offer_lower = Offer.objects.create(
            order=self.order,
            provider=self.worker_user,
            proposed_price=Decimal('70.00')  # Lower than order's 80.00
        )
        
        self.assertGreater(offer_higher.proposed_price, self.order.offered_price)
        self.assertLess(offer_lower.proposed_price, self.order.offered_price)


