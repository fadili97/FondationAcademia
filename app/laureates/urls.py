# laureates/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LaureateViewSet

router = DefaultRouter()
router.register(r'laureates', LaureateViewSet, basename='laureate')
urlpatterns = [
    path('', include(router.urls)),
]
