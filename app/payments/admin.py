
# payments/admin.py
from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'loan', 'amount', 'due_date', 'paid_date', 'status']
    list_filter = ['status', 'due_date', 'paid_date']
    search_fields = ['loan__laureate__user__first_name', 'loan__laureate__user__last_name', 'transaction_id']
    ordering = ['-due_date']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('loan', 'amount', 'due_date', 'paid_date')
        }),
        ('Status & Details', {
            'fields': ('status', 'payment_method', 'transaction_id', 'notes')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']