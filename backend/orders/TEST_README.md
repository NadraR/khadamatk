# Orders App Test Suite Documentation

## 📋 Overview

This comprehensive test suite covers all aspects of the Orders app functionality, including models, API endpoints, serializers, and business logic.

## 🧪 Test Structure

### 1. Model Tests (`test_models.py`)
Tests the core data models and their relationships:

- **OrderModelTest**: Order creation, validation, relationships, status transitions
- **OfferModelTest**: Offer creation, acceptance, multiple offers per order
- **NegotiationModelTest**: Negotiation creation, message handling, price proposals
- **BookingModelTest**: Booking creation, status management, string representation

### 2. API Tests (`test_api.py`)
Tests REST API endpoints and HTTP operations:

- **OrderAPITest**: CRUD operations, authentication, permissions, soft delete
- **OfferAPITest**: Offer creation, listing, worker-only permissions
- **NegotiationAPITest**: Negotiation creation, authorization checks

### 3. Serializer Tests (`test_serializers.py`)
Tests data serialization and validation:

- **OrderSerializerTest**: Data serialization/deserialization, read-only fields
- **OfferSerializerTest**: Offer data handling, validation
- **NegotiationSerializerTest**: Message and price serialization
- **SerializerIntegrationTest**: Full workflow testing

### 4. Business Logic Tests (`test_business_logic.py`)
Tests complex business scenarios and edge cases:

- **OrderBusinessLogicTest**: Status transitions, location handling, timing
- **OrderSignalTest**: Signal handling, chat closure automation
- **OrderValidationTest**: Edge cases, price validation, constraints
- **OrderQueryTest**: Database queries, filtering, relationships
- **OfferBusinessLogicTest**: Offer acceptance, price comparisons

## 🚀 Running Tests

### Run All Tests
```bash
# From backend directory
python manage.py test orders

# With verbose output
python manage.py test orders --verbosity=2

# Using the custom test runner
python orders/run_tests.py
```

### Run Specific Test Modules
```bash
# Model tests only
python manage.py test orders.test_models

# API tests only
python manage.py test orders.test_api

# Serializer tests only
python manage.py test orders.test_serializers

# Business logic tests only
python manage.py test orders.test_business_logic
```

### Run Specific Test Classes
```bash
# Order model tests only
python manage.py test orders.test_models.OrderModelTest

# Order API tests only
python manage.py test orders.test_api.OrderAPITest
```

### Run Specific Test Methods
```bash
# Test order creation only
python manage.py test orders.test_models.OrderModelTest.test_order_creation

# Test API authentication only
python manage.py test orders.test_api.OrderAPITest.test_order_list_unauthenticated
```

## 📊 Test Coverage

### Models Covered
- ✅ Order (creation, validation, relationships, soft delete)
- ✅ Offer (creation, acceptance, multiple offers)
- ✅ Negotiation (messaging, price proposals)
- ✅ Booking (scheduling, status management)

### API Endpoints Covered
- ✅ `GET /api/orders/` - List orders
- ✅ `POST /api/orders/` - Create order
- ✅ `GET /api/orders/{id}/` - Get order details
- ✅ `PUT /api/orders/{id}/` - Update order
- ✅ `DELETE /api/orders/{id}/` - Soft delete order
- ✅ `GET /api/orders/{id}/offers/` - List offers
- ✅ `POST /api/orders/{id}/offers/` - Create offer
- ✅ `GET /api/orders/{id}/negotiations/` - List negotiations
- ✅ `POST /api/orders/{id}/negotiations/` - Create negotiation

### Business Logic Covered
- ✅ Order status transitions (pending → accepted → completed)
- ✅ Order cancellation from any status
- ✅ Worker restrictions (cannot create orders)
- ✅ Client restrictions (cannot make offers on own orders)
- ✅ Authorization checks (only order owner can modify)
- ✅ Soft delete functionality
- ✅ Location coordinate precision
- ✅ Price validation and edge cases
- ✅ Signal handling for chat closure

### Edge Cases Covered
- ✅ Negative prices
- ✅ Zero prices
- ✅ Very large prices
- ✅ Missing optional fields
- ✅ Invalid data validation
- ✅ Unauthorized access attempts
- ✅ Multiple offers per order
- ✅ Future scheduling times

## 🔧 Test Configuration

### Database
Tests use Django's test database (separate from development database).

### Authentication
Tests use Django's `force_authenticate()` for API testing.

### Mocking
Signal tests use `unittest.mock.patch` for external dependencies.

### Fixtures
Each test class sets up its own test data in the `setUp()` method.

## 📈 Performance Considerations

### Test Optimization
- Tests use minimal data setup
- Database queries are optimized
- Mocking is used for external services
- Tests are independent and can run in parallel

### Memory Usage
- Test data is cleaned up automatically
- No persistent test data between test runs

## 🐛 Debugging Tests

### Verbose Output
```bash
python manage.py test orders --verbosity=2
```

### Debug Specific Test
```bash
python manage.py test orders.test_models.OrderModelTest.test_order_creation --verbosity=2 --debug-mode
```

### Print Debug Information
Add print statements or use `pdb.set_trace()` in test methods for debugging.

## 🔄 Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Run Orders Tests
  run: |
    cd backend
    python manage.py test orders --verbosity=2
```

## 📝 Adding New Tests

### For New Models
1. Add test class to `test_models.py`
2. Test creation, validation, relationships
3. Test string representation and methods

### For New API Endpoints
1. Add test methods to appropriate class in `test_api.py`
2. Test all HTTP methods (GET, POST, PUT, DELETE)
3. Test authentication and authorization
4. Test error cases

### For New Business Logic
1. Add test methods to `test_business_logic.py`
2. Test happy path and edge cases
3. Mock external dependencies
4. Test signal handlers

## 🎯 Test Quality Guidelines

### Test Naming
- Use descriptive names: `test_order_creation_with_valid_data`
- Follow pattern: `test_<what>_<condition>_<expected_result>`

### Test Structure
- Arrange: Set up test data
- Act: Perform the action being tested
- Assert: Verify the expected outcome

### Test Independence
- Each test should be independent
- Use `setUp()` and `tearDown()` methods
- Don't rely on test execution order

### Assertions
- Use specific assertions: `assertEqual`, `assertIn`, `assertRaises`
- Include meaningful error messages
- Test both positive and negative cases

## 🏆 Best Practices

1. **Test Coverage**: Aim for >90% code coverage
2. **Test Speed**: Keep tests fast and focused
3. **Test Clarity**: Make tests readable and maintainable
4. **Test Reliability**: Tests should pass consistently
5. **Test Documentation**: Document complex test scenarios

## 🔍 Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Database Errors**: Check database configuration
3. **Permission Errors**: Verify user roles and permissions
4. **Signal Errors**: Mock external dependencies properly

### Getting Help

- Check Django test documentation
- Review error messages carefully
- Use verbose output for debugging
- Add print statements for troubleshooting


