from django.urls import path
from .views import message_list_create

urlpatterns = [
    path('', message_list_create, name="message-list-create"),
]
