# laureates/admin.py
from django.contrib import admin
from .models import Laureate

@admin.register(Laureate)
class LaureateAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'user', 'institution', 'field_of_study', 'graduation_year', 'is_active']
    list_filter = ['is_active', 'graduation_year', 'institution']
    search_fields = ['student_id', 'user__first_name', 'user__last_name', 'user__email', 'institution']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Academic Information', {
            'fields': ('student_id', 'institution', 'field_of_study', 'graduation_year', 'gpa')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
