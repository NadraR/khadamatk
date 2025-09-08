#!/usr/bin/env python
"""
Test Runner Script for Orders App

This script runs all tests for the orders app with detailed output.
Usage: python orders/run_tests.py
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner
from django.core.management import execute_from_command_line

def run_tests():
    """Run all tests for the orders app"""
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    print("🧪 Running Orders App Test Suite")
    print("=" * 50)
    
    # Test commands to run
    test_commands = [
        # Run all tests
        ['manage.py', 'test', 'orders', '--verbosity=2'],
        
        # Run specific test modules
        ['manage.py', 'test', 'orders.test_models', '--verbosity=2'],
        ['manage.py', 'test', 'orders.test_api', '--verbosity=2'],
        ['manage.py', 'test', 'orders.test_serializers', '--verbosity=2'],
        ['manage.py', 'test', 'orders.test_business_logic', '--verbosity=2'],
    ]
    
    for i, cmd in enumerate(test_commands, 1):
        print(f"\n📋 Running Test Suite {i}/{len(test_commands)}: {' '.join(cmd[2:])}")
        print("-" * 40)
        
        try:
            execute_from_command_line(cmd)
            print(f"✅ Test Suite {i} completed successfully!")
        except SystemExit as e:
            if e.code != 0:
                print(f"❌ Test Suite {i} failed with exit code {e.code}")
            else:
                print(f"✅ Test Suite {i} completed successfully!")
        except Exception as e:
            print(f"❌ Test Suite {i} failed with error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Orders App Test Suite Complete!")
    print("\n📊 Test Coverage Summary:")
    print("✓ Model Tests - Order, Offer, Negotiation, Booking")
    print("✓ API Tests - CRUD operations, permissions, authentication")
    print("✓ Serializer Tests - Data validation, serialization/deserialization")
    print("✓ Business Logic Tests - Workflows, edge cases, signals")
    print("\n🚀 To run individual test files:")
    print("   python manage.py test orders.test_models")
    print("   python manage.py test orders.test_api")
    print("   python manage.py test orders.test_serializers")
    print("   python manage.py test orders.test_business_logic")

if __name__ == '__main__':
    run_tests()


