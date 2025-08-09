# administration/serializers.py
from rest_framework import serializers
from .models import ActivityLog, Report

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'user_name', 'action', 'model_name', 'object_id', 
                 'description', 'ip_address', 'timestamp']

class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = Report
        fields = ['id', 'title', 'report_type', 'generated_by_name', 
                 'date_from', 'date_to', 'parameters', 'file_path', 'created_at']
        read_only_fields = ['generated_by_name', 'created_at']

class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['title', 'report_type', 'date_from', 'date_to', 'parameters']