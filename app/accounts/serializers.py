# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User



class LaureateRegistrationSerializer(serializers.ModelSerializer):
    """Updated registration - creates INACTIVE laureates for approval"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 
                 'last_name', 'phone', 'address', 'birth_date']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Password confirmation doesn't match password.")
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        # Create regular user (not superuser) - INACTIVE by default
        user = User.objects.create_user(
            is_superuser=False,
            is_active=True,  # User account is active but laureate profile is inactive
            **validated_data
        )
        user.set_password(password)
        user.save()
        
        # Auto-create INACTIVE laureate profile (needs admin approval)
        from laureates.models import Laureate
        Laureate.objects.create(
            user=user,
            student_id=f"LAU{user.id:06d}",
            institution="",
            field_of_study="",
            graduation_year=2025,
            is_active=False,  # THIS IS THE KEY - requires admin approval
        )
        
        return user

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                 'phone', 'address', 'birth_date', 'profile_picture',
                 'is_active', 'is_superuser', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'is_superuser']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'address', 'birth_date', 'profile_picture']
