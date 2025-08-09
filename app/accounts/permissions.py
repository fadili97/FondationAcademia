# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """Only superusers can access admin features"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser

class IsLaureateUser(BasePermission):
    """Only regular users (non-superusers) can access laureate features"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and not request.user.is_superuser
