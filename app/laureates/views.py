from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from accounts.permissions import IsAdminUser, IsLaureateUser
from .models import Laureate
from .serializers import LaureateSerializer, LaureateBasicSerializer

class LaureateViewSet(viewsets.ModelViewSet):
    serializer_class = LaureateSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = Laureate.objects.all().select_related('user')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(student_id__icontains=search) |
                Q(institution__icontains=search) |
                Q(user__email__icontains=search)
            )
        
        # Filter by active status
        is_active = self.request.query_params.get('active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def get_permissions(self):
        if self.action == 'my_profile':
            permission_classes = [IsAuthenticated, IsLaureateUser]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LaureateBasicSerializer
        return LaureateSerializer
    
    @action(detail=False, methods=['get'], url_path='pending-applications')
    def pending_applications(self, request):
        """Get all pending applications (inactive laureates)"""
        pending = Laureate.objects.filter(
            is_active=False
        ).select_related('user').order_by('-created_at')
        
        serializer = LaureateSerializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_application(self, request, pk=None):
        """Approve a pending application"""
        laureate = self.get_object()
        if laureate.is_active:
            return Response(
                {"error": "Laureate is already active"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        laureate.is_active = True
        laureate.save()
        
        # Log the approval activity
        from administration.models import ActivityLog
        ActivityLog.objects.create(
            user=request.user,
            action='approve',
            model_name='Laureate',
            object_id=laureate.id,
            description=f"Approved application for {laureate.user.get_full_name()}",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({"message": "Application approved successfully"})
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject_application(self, request, pk=None):
        """Reject a pending application"""
        laureate = self.get_object()
        if laureate.is_active:
            return Response(
                {"error": "Cannot reject an active laureate"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Deactivate the user account
        user = laureate.user
        user.is_active = False
        user.save()
        
        # Log the rejection activity
        from administration.models import ActivityLog
        ActivityLog.objects.create(
            user=request.user,
            action='reject',
            model_name='Laureate',
            object_id=laureate.id,
            description=f"Rejected application for {laureate.user.get_full_name()}",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({"message": "Application rejected successfully"})
    
    @action(detail=False, methods=['get', 'put'])
    def my_profile(self, request):
        """Laureate can get/update their own profile"""
        if request.user.is_superuser:
            return Response(
                {"error": "Admins don't have laureate profiles"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            laureate = request.user.laureate_profile
        except Laureate.DoesNotExist:
            return Response(
                {"error": "Laureate profile not found. Please contact admin."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            serializer = LaureateSerializer(laureate)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = LaureateSerializer(laureate, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle laureate active status - admin only"""
        laureate = self.get_object()
        laureate.is_active = not laureate.is_active
        laureate.save()
        
        status_text = "activated" if laureate.is_active else "deactivated"
        
        # Log the status change
        from administration.models import ActivityLog
        ActivityLog.objects.create(
            user=request.user,
            action='status_change',
            model_name='Laureate',
            object_id=laureate.id,
            description=f"{status_text.title()} laureate {laureate.user.get_full_name()}",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({"message": f"Laureate {status_text} successfully"})
