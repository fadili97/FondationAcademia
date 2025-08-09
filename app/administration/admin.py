# administration/admin.py
from django.contrib import admin
from .models import ActivityLog, Report

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'object_id', 'timestamp']
    list_filter = ['action', 'model_name', 'timestamp']
    search_fields = ['user__username', 'user__email', 'description']
    ordering = ['-timestamp']
    readonly_fields = ['timestamp']

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'report_type', 'generated_by', 'date_from', 'date_to', 'created_at']
    list_filter = ['report_type', 'created_at']
    search_fields = ['title', 'generated_by__username']
    ordering = ['-created_at']
    readonly_fields = ['created_at']