# administration/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet, ActivityLogViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'activity-logs', ActivityLogViewSet)
router.register(r'reports', ReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
