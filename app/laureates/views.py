# Add these imports at the top
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.db import transaction  # Add this import
from accounts.permissions import IsAdminUser, IsLaureateUser
from accounts.models import User  # Add this import
from .models import Laureate
from .serializers import LaureateSerializer, LaureateBasicSerializer


import random
from django.utils import timezone

def generate_unique_student_id(prefix="LAU"):
    """Generate a unique student ID"""
    max_attempts = 100
    for _ in range(max_attempts):
        # Generate 6-digit number
        number = random.randint(100000, 999999)
        student_id = f"{prefix}{number}"
        
        # Check if it already exists
        if not Laureate.objects.filter(student_id=student_id).exists():
            return student_id
    
    # Fallback: use timestamp if we can't generate unique ID
    timestamp = int(timezone.now().timestamp())
    return f"{prefix}{str(timestamp)[-6:]}"



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
    
    # FIXED: Correct URL paths without nested path
    @action(detail=False, methods=['post'], url_path='create_single')
    def create_single_laureate(self, request):
        """Create a single laureate"""
        data = request.data
        try:
            with transaction.atomic():
                # Auto-generate student_id if not provided
                student_id = data.get('student_id', '').strip()
                if not student_id:
                    student_id = generate_unique_student_id()
                
                # Check for existing users
                if User.objects.filter(email=data['email']).exists():
                    return Response({'error': 'Email already exists'}, status=400)
                if User.objects.filter(username=data['username']).exists():
                    return Response({'error': 'Username already exists'}, status=400)
                if Laureate.objects.filter(student_id=student_id).exists():
                    return Response({'error': 'Student ID already exists'}, status=400)
                
                # Create user
                user = User.objects.create_user(
                    username=data['username'],
                    email=data['email'],
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    password=data.get('password', 'TempPassword123!')
                )
                
                # Create laureate with generated student_id
                laureate = Laureate.objects.create(
                    user=user,
                    student_id=student_id,  # Use generated ID
                    institution=data.get('institution', ''),
                    field_of_study=data.get('field_of_study', ''),
                    graduation_year=int(data.get('graduation_year', 2025)),
                    is_active=True
                )
                
                return Response({
                    'message': 'Laureate created successfully',
                    'student_id': student_id,
                    'laureate_id': laureate.id
                })
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    # Also update your bulk_create_laureates method:
    @action(detail=False, methods=['post'], url_path='bulk_create')
    def bulk_create_laureates(self, request):
        """Bulk create from CSV"""
        if 'csv_file' not in request.FILES:
            return Response({'error': 'No CSV file'}, status=400)
        
        import csv, io
        csv_file = request.FILES['csv_file']
        decoded_file = csv_file.read().decode('utf-8')
        csv_data = csv.DictReader(io.StringIO(decoded_file))
        
        created_count = 0
        error_count = 0
        created_laureates = []
        
        for row in csv_data:
            try:
                with transaction.atomic():
                    # Auto-generate student_id if not provided
                    student_id = row.get('student_id', '').strip()
                    if not student_id:
                        student_id = generate_unique_student_id()
                    
                    # Skip if user/student already exists
                    if (User.objects.filter(email=row['email']).exists() or 
                        User.objects.filter(username=row['username']).exists() or
                        Laureate.objects.filter(student_id=student_id).exists()):
                        error_count += 1
                        continue
                    
                    user = User.objects.create_user(
                        username=row['username'],
                        email=row['email'],
                        first_name=row['first_name'],
                        last_name=row['last_name'],
                        password='TempPassword123!'
                    )
                    
                    laureate = Laureate.objects.create(
                        user=user,
                        student_id=student_id,  # Use generated ID
                        institution=row.get('institution', ''),
                        field_of_study=row.get('field_of_study', ''),
                        graduation_year=int(row.get('graduation_year', 2025)),
                        is_active=True
                    )
                    
                    created_laureates.append({
                        'name': laureate.user.get_full_name(),
                        'student_id': student_id,
                        'email': laureate.user.email
                    })
                    created_count += 1
            except Exception as e:
                error_count += 1
        
        return Response({
            'created_count': created_count,
            'error_count': error_count,
            'total_processed': created_count + error_count,
            'created_laureates': created_laureates
        })