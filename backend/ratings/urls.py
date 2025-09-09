from django.urls import path
from . import views

urlpatterns = [
    path("service/<int:service_id>/", views.service_ratings, name="service_ratings"),
    path("service/<int:service_id>/add/", views.add_or_update_rating, name="add_or_update_rating"),
    path("my-ratings/", views.my_ratings, name="my_ratings"),
    path("provider/<int:provider_id>/", views.provider_ratings, name="provider_ratings"),
]
