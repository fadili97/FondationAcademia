# loans/models.py
from django.db import models
from laureates.models import Laureate
from accounts.models import User
from datetime import timedelta

class Loan(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
        ('suspended', 'Suspended'),
    ]
    
    laureate = models.ForeignKey(Laureate, on_delete=models.CASCADE, related_name='loans')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    start_date = models.DateField()
    end_date = models.DateField()
    monthly_payment = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def remaining_balance(self):
        from payments.models import Payment
        total_paid = Payment.objects.filter(
            loan=self, 
            status='completed'
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        return float(self.amount) - float(total_paid)
    
    @property
    def next_payment_date(self):
        from payments.models import Payment
        next_payment = Payment.objects.filter(
            loan=self, 
            status='pending'
        ).order_by('due_date').first()
        
        if next_payment:
            return next_payment.due_date
        return None
    
    @property
    def total_paid(self):
        from payments.models import Payment
        return Payment.objects.filter(
            loan=self, 
            status='completed'
        ).aggregate(total=models.Sum('amount'))['total'] or 0
    
    def __str__(self):
        return f"Loan #{self.id} - {self.laureate.user.get_full_name()}"
    
    class Meta:
        ordering = ['-created_at']
