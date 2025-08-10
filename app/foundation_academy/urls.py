from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework import status
from django.views.generic import TemplateView
# Custom Token Serializer for Email Login
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # Use email instead of username
    
    def validate(self, attrs):
        # Convert email to username for authentication
        email = attrs.get('username')  # Frontend sends as 'username'
        
        try:
            from accounts.models import User
            user = User.objects.get(email=email)
            attrs['username'] = user.username  # Use actual username for auth
        except User.DoesNotExist:
            pass  # Let the parent handle the error
        
        data = super().validate(attrs)
        user = self.user
        
        # Add user info to the response
        data['user_info'] = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name(),
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_superuser': user.is_superuser,
            'role': 'admin' if user.is_superuser else 'laureate',
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {"error": "Invalid email or password"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


urlpatterns = [ path("admin/", admin.site.urls),]


urlpatterns += [
   
    
    # Authentication - Email/Password login
    path("api/token/", CustomTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    
    # App URLs
    path('api/accounts/', include('accounts.urls')),
    path('api/laureates/', include('laureates.urls')),
    path('api/loans/', include('loans.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/admin/', include('administration.urls')),
]
urlpatterns += [re_path(r'^.*$', TemplateView.as_view(template_name="index.html"))]
# # Serve media files in development
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
