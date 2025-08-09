# accounts/viewsets.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User
from .serializers import LaureateRegistrationSerializer, UserSerializer, UserUpdateSerializer
from .permissions import IsAdminUser

class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints"""
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Public registration endpoint - Only for laureates"""
        serializer = LaureateRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Account created successfully! You can now login.",
                "user_id": user.id,
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    """User management - Admin only"""
    queryset = User.objects.filter(is_superuser=False)  # Only show regular users
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_permissions(self):
        if self.action == 'profile':
            permission_classes = [IsAuthenticated]  # Anyone can access their own profile
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]  # Only admins
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get', 'put'], url_path='profile')
    def profile(self, request):
        """Get or update current user's profile"""
        user = request.user
        
        if request.method == 'GET':
            serializer = UserSerializer(user)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(UserSerializer(user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle user active status - admin only"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        status_text = "activated" if user.is_active else "deactivated"
        return Response({"message": f"User {status_text} successfully"})