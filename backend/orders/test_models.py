"""
Unit Tests for Orders Models
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta

from .models import Order, Offer, Negotiation, Booking
from services.models import Service
from accounts.models import WorkerProfile

User = get_user_model()


class OrderModelTest(TestCase):
    """Test Order model functionality"""
    
    def setUp(self):
        """Set up test data"""
        # Create users
        self.client_user = User.objects.create_user(
            username='test_client',
            email='client@test.com',
            password='testpass123',
            role='client'
        )
        
        self.worker_user = User.objects.create_user(
            username='test_worker',
            email='worker@test.com',
            password='testpass123',
            role='worker'
        )
        
        # Create worker profile
        self.worker_profile = WorkerProfile.objects.create(
            user=self.worker_user,
            job_title='فني كهرباء',
            experience_years=5,
            hourly_rate=Decimal('50.00')
        )
        
        # Create service
        self.service = Service.objects.create(
            name='خدمة كهربائية',
            description='إصلاح وتركيب كهربائي',
            price=Decimal('100.00'),
            provider=self.worker_user
        )
        
        # Create order
        self.order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            description='إصلاح مفتاح كهربائي',
            offered_price=Decimal('80.00'),
            location_lat=24.7136,
            location_lng=46.6753,
            scheduled_time=timezone.now() + timedelta(hours=2),
            delivery_time=timezone.now() + timedelta(days=1)
        )
    
    def test_order_creation(self):
        """Test order is created correctly"""
        self.assertEqual(self.order.customer, self.client_user)
        self.assertEqual(self.order.service, self.service)
        self.assertEqual(self.order.status, 'pending')
        self.assertFalse(self.order.is_deleted)
        self.assertIsNotNone(self.order.date_created)
        
    def test_order_status_choices(self):
        """Test order status choices"""
        valid_statuses = ['pending', 'accepted', 'completed', 'cancelled']
        for status_choice in valid_statuses:
            self.order.status = status_choice
            self.order.save()
            self.assertEqual(self.order.status, status_choice)
    
    def test_order_soft_delete(self):
        """Test soft delete functionality"""
        self.order.is_deleted = True
        self.order.save()
        self.assertTrue(self.order.is_deleted)
        
    def test_order_location_coordinates(self):
        """Test location coordinates are saved correctly"""
        self.assertEqual(float(self.order.location_lat), 24.7136)
        self.assertEqual(float(self.order.location_lng), 46.6753)
    
    def test_order_price_field(self):
        """Test offered price field"""
        self.assertEqual(self.order.offered_price, Decimal('80.00'))
        
    def test_order_relationships(self):
        """Test foreign key relationships"""
        self.assertEqual(self.order.customer.id, self.client_user.id)
        self.assertEqual(self.order.service.id, self.service.id)


class OfferModelTest(TestCase):
    """Test Offer model functionality"""
    
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
    
    def test_offer_creation(self):
        """Test offer is created correctly"""
        self.assertEqual(self.offer.order, self.order)
        self.assertEqual(self.offer.provider, self.worker_user)
        self.assertEqual(self.offer.proposed_price, Decimal('90.00'))
        self.assertFalse(self.offer.accepted)
        self.assertIsNotNone(self.offer.date_created)
    
    def test_offer_acceptance(self):
        """Test offer acceptance"""
        self.offer.accepted = True
        self.offer.save()
        self.assertTrue(self.offer.accepted)
    
    def test_multiple_offers_per_order(self):
        """Test multiple offers can be created for one order"""
        worker2 = User.objects.create_user(
            username='worker2', email='worker2@test.com', password='pass', role='worker'
        )
        
        offer2 = Offer.objects.create(
            order=self.order,
            provider=worker2,
            proposed_price=Decimal('85.00')
        )
        
        self.assertEqual(self.order.offers.count(), 2)
        self.assertIn(self.offer, self.order.offers.all())
        self.assertIn(offer2, self.order.offers.all())


class NegotiationModelTest(TestCase):
    """Test Negotiation model functionality"""
    
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
    
    def test_negotiation_creation(self):
        """Test negotiation is created correctly"""
        self.assertEqual(self.negotiation.order, self.order)
        self.assertEqual(self.negotiation.sender, self.client_user)
        self.assertEqual(self.negotiation.message, 'Can you do it for 75?')
        self.assertEqual(self.negotiation.proposed_price, Decimal('75.00'))
        self.assertIsNotNone(self.negotiation.date_created)
    
    def test_negotiation_without_price(self):
        """Test negotiation can be created without proposed price"""
        negotiation = Negotiation.objects.create(
            order=self.order,
            sender=self.worker_user,
            message='I can do it tomorrow'
        )
        
        self.assertIsNone(negotiation.proposed_price)
        self.assertEqual(negotiation.message, 'I can do it tomorrow')


class BookingModelTest(TestCase):
    """Test Booking model functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='user', email='user@test.com', password='pass'
        )
        self.worker = User.objects.create_user(
            username='worker', email='worker@test.com', password='pass', role='worker'
        )
        
        self.service = Service.objects.create(
            name='Test Service', price=Decimal('100.00'), provider=self.worker
        )
        
        self.booking = Booking.objects.create(
            user=self.user,
            service=self.service,
            scheduled_time=timezone.now() + timedelta(hours=2),
            notes='Test booking'
        )
    
    def test_booking_creation(self):
        """Test booking is created correctly"""
        self.assertEqual(self.booking.user, self.user)
        self.assertEqual(self.booking.service, self.service)
        self.assertEqual(self.booking.status, 'pending')
        self.assertEqual(self.booking.notes, 'Test booking')
        self.assertIsNotNone(self.booking.created_at)
        self.assertIsNotNone(self.booking.updated_at)
    
    def test_booking_str_representation(self):
        """Test string representation of booking"""
        expected = f"Booking #{self.booking.id} - {self.service.name}"
        self.assertEqual(str(self.booking), expected)
    
    def test_booking_status_choices(self):
        """Test booking status choices"""
        valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled']
        for status_choice in valid_statuses:
            self.booking.status = status_choice
            self.booking.save()
            self.assertEqual(self.booking.status, status_choice)


