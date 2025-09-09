"""
Unit Tests for Orders API Views
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal

from .models import Order, Offer, Negotiation
from .serializers import OrderSerializer, OfferSerializer, NegotiationSerializer
from services.models import Service
from accounts.models import WorkerProfile

User = get_user_model()


class OrderAPITest(APITestCase):
    """Test Order API endpoints"""
    
    def setUp(self):
        """Set up test data and authentication"""
        # Create users
        self.client_user = User.objects.create_user(
            username='client', email='client@test.com', password='testpass123', role='client'
        )
        self.worker_user = User.objects.create_user(
            username='worker', email='worker@test.com', password='testpass123', role='worker'
        )
        self.admin_user = User.objects.create_user(
            username='admin', email='admin@test.com', password='testpass123', 
            role='admin', is_staff=True
        )
        
        # Create service
        self.service = Service.objects.create(
            name='Test Service', price=Decimal('100.00'), provider=self.worker_user
        )
        
        # Create order
        self.order = Order.objects.create(
            customer=self.client_user,
            service=self.service,
            description='Test order',
            offered_price=Decimal('80.00')
        )
        
        # API client
        self.api_client = APIClient()
    
    def test_order_list_authenticated_client(self):
        """Test order list for authenticated client"""
        self.api_client.force_authenticate(user=self.client_user)
        url = reverse('order_list')
        response = self.api_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.order.id)
    
    def test_order_list_authenticated_admin(self):
        """Test order list for admin user"""
        self.api_client.force_authenticate(user=self.admin_user)
        url = reverse('order_list')
        response = self.api_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_order_list_unauthenticated(self):
        """Test order list without authentication"""
        url = reverse('order_list')
        response = self.api_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_order_as_client(self):
        """Test creating order as client"""
        self.api_client.force_authenticate(user=self.client_user)
        url = reverse('order_list')
        
        data = {
            'service': self.service.id,
            'description': 'New order from API',
            'offered_price': '95.00',
            'location_lat': 24.7136,
            'location_lng': 46.6753
        }
        
        response = self.api_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Order created')
        self.assertTrue(Order.objects.filter(description='New order from API').exists())
    
    def test_create_order_as_worker_forbidden(self):
        """Test creating order as worker should be forbidden"""
        self.api_client.force_authenticate(user=self.worker_user)
        url = reverse('order_list')
        
        data = {
            'service': self.service.id,
            'description': 'Worker trying to create order',
            'offered_price': '95.00'
        }
        
        response = self.api_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Workers cannot create orders', response.data['error'])
    
    def test_order_detail_get(self):
        """Test getting order details"""
        self.api_client.force_authenticate(user=self.client_user)
        url = reverse('order_detail', kwargs={'pk': self.order.id})
        response = self.api_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.order.id)
        self.assertEqual(response.data['description'], 'Test order')
    
    def test_order_detail_update_by_owner(self):
        """Test updating order by owner"""
        self.api_client.force_authenticate(user=self.client_user)
        url = reverse('order_detail', kwargs={'pk': self.order.id})
        
        data = {
            'description': 'Updated order description',
            'offered_price': '85.00'
        }
        
        response = self.api_client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Order updated')
        
        # Verify update
        self.order.refresh_from_db()
        self.assertEqual(self.order.description, 'Updated order description')
        self.assertEqual(self.order.offered_price, Decimal('85.00'))
    
    def test_order_detail_update_by_non_owner_forbidden(self):
        """Test updating order by non-owner should be forbidden"""
        other_user = User.objects.create_user(
            username='other', email='other@test.com', password='pass', role='client'
        )
        
        self.api_client.force_authenticate(user=other_user)
        url = reverse('order_detail', kwargs={'pk': self.order.id})
        
        data = {'description': 'Unauthorized update'}
        response = self.api_client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Not allowed', response.data['error'])
    
    def test_order_soft_delete_by_owner(self):
        """Test soft deleting order by owner"""
        self.api_client.force_authenticate(user=self.client_user)
        url = reverse('order_detail', kwargs={'pk': self.order.id})
        response = self.api_client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Order soft deleted')
        
        # Verify soft delete
        self.order.refresh_from_db()
        self.assertTrue(self.order.is_deleted)
    
    def test_order_soft_delete_by_non_owner_forbidden(self):
        """Test soft deleting order by non-owner should be forbidden"""
        other_user = User.objects.create_user(
            username='other', email='other@test.com', password='pass', role='client'
        )
        
        self.api_client.force_authenticate(user=other_user)
        url = reverse('order_detail', kwargs={'pk': self.order.id})
        response = self.api_client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Not allowed', response.data['error'])


class OfferAPITest(APITestCase):
    """Test Offer API endpoints"""
    
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
        
        self.api_client = APIClient()
    
    def test_offer_list_get(self):
        """Test getting offers for an order"""
        # Create an offer
        offer = Offer.objects.create(
            order=self.order,
            provider=self.worker_user,
            proposed_price=Decimal('90.00')
        )
        
        self.api_client.force_authenticate(user=self.client_user)
        url = reverse('offer_list', kwargs={'order_id': self.order.id})
        response = self.api_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], offer.id)
    
    def test_create_offer_as_worker(self):
        """Test creating offer as worker"""
        self.api_client.force_authenticate(user=self.worker_user)
        url = reverse('offer_list', kwargs={'order_id': self.order.id})
        
        data = {
            'proposed_price': '95.00'
        }
        
        response = self.api_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Offer created')
        self.assertTrue(Offer.objects.filter(proposed_price=Decimal('95.00')).exists())
    
    def test_create_offer_as_client_forbidden(self):
        """Test creating offer as client should be forbidden"""
        self.api_client.force_authenticate(user=self.client_user)
        url = reverse('offer_list', kwargs={'order_id': self.order.id})
        
        data = {
            'proposed_price': '95.00'
        }
        
        response = self.api_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Client cannot make offers', response.data['error'])


class NegotiationAPITest(APITestCase):
    """Test Negotiation API endpoints"""
    
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
        
        # Create offer so worker can negotiate
        self.offer = Offer.objects.create(
            order=self.order,
            provider=self.worker_user,
            proposed_price=Decimal('90.00')
        )
        
        self.api_client = APIClient()
    
    def test_negotiation_list_get(self):
        """Test getting negotiations for an order"""
        # Create negotiation
        negotiation = Negotiation.objects.create(
            order=self.order,
            sender=self.client_user,
            message='Can you do it for 85?',
            proposed_price=Decimal('85.00')
        )
        
        self.api_client.force_authenticate(user=self.client_user)
        url = reverse('negotiation_list', kwargs={'order_id': self.order.id})
        response = self.api_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], negotiation.id)
    
    def test_create_negotiation_as_client(self):
        """Test creating negotiation as client (order owner)"""
        self.api_client.force_authenticate(user=self.client_user)
        url = reverse('negotiation_list', kwargs={'order_id': self.order.id})
        
        data = {
            'message': 'Can you do it for 85?',
            'proposed_price': '85.00'
        }
        
        response = self.api_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Negotiation sent')
    
    def test_create_negotiation_as_worker_with_offer(self):
        """Test creating negotiation as worker who has made an offer"""
        self.api_client.force_authenticate(user=self.worker_user)
        url = reverse('negotiation_list', kwargs={'order_id': self.order.id})
        
        data = {
            'message': 'I can do it for 88',
            'proposed_price': '88.00'
        }
        
        response = self.api_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Negotiation sent')
    
    def test_create_negotiation_as_unauthorized_user_forbidden(self):
        """Test creating negotiation as unauthorized user should be forbidden"""
        unauthorized_user = User.objects.create_user(
            username='unauthorized', email='unauth@test.com', password='pass'
        )
        
        self.api_client.force_authenticate(user=unauthorized_user)
        url = reverse('negotiation_list', kwargs={'order_id': self.order.id})
        
        data = {
            'message': 'Unauthorized negotiation',
            'proposed_price': '75.00'
        }
        
        response = self.api_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Not allowed', response.data['error'])


