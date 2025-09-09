from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Accounts
    path('api/accounts/', include('accounts.urls')),

    # Admin API
    path('api/admin/', include('admin_api.urls')),

    # Services
    path('api/services/', include('services.urls')),

    # Reviews
    path('api/reviews/', include('reviews.urls')),

    # Orders
    path('api/orders/', include('orders.urls')),

    # Invoices - Temporarily disabled
    # path('api/invoices/', include('invoices.urls')),

    # Ratings
    path('api/ratings/', include('ratings.urls')),

    # Location
    path('api/location/', include('location.urls')),

    # Djoser Auth
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),

    # Chat - Temporarily disabled
    # path("api/chat/", include("chat.urls")),

    # Notifications
    path('api/notifications/', include('notifications.urls')),
    # Favorites are handled in services app
    # path('api/favorites/', include('favorites.urls')),

]