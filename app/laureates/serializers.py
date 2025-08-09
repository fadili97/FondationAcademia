# laureates/serializers.py
from rest_framework import serializers
from accounts.serializers import UserSerializer, UserUpdateSerializer
from .models import Laureate

class LaureateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_data = UserUpdateSerializer(write_only=True, required=False)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Laureate
        fields = ['id', 'user', 'user_data', 'full_name', 'email', 'student_id', 'institution', 
                 'field_of_study', 'graduation_year', 'gpa', 
                 'emergency_contact_name', 'emergency_contact_phone', 
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user_data', {})
        
        # Update user data if provided
        if user_data:
            user_serializer = UserUpdateSerializer(instance.user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
        
        # Update laureate data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

class LaureateBasicSerializer(serializers.ModelSerializer):
    """Simplified serializer for lists and basic info"""
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Laureate
        fields = ['id', 'student_id', 'full_name', 'email', 'institution', 
                 'field_of_study', 'graduation_year', 'is_active']
