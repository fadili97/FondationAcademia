# loans/admin.py
from django.contrib import admin
from .models import Loan

@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ['id', 'laureate', 'amount', 'monthly_payment', 'status', 'start_date', 'created_at']
    list_filter = ['status', 'start_date', 'created_at']
    search_fields = ['laureate__user__first_name', 'laureate__user__last_name', 'laureate__student_id']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Loan Information', {
            'fields': ('laureate', 'amount', 'interest_rate', 'monthly_payment')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Status & Notes', {
            'fields': ('status', 'notes', 'created_by')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
