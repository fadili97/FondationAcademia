# payments/models.py
from django.db import models
from loans.models import Loan

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
        ('missed', 'Missed'),
    ]
    
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        return self.status == 'pending' and self.due_date < timezone.now().date()
    
    @property
    def days_overdue(self):
        from django.utils import timezone
        if self.is_overdue:
            return (timezone.now().date() - self.due_date).days
        return 0
    
    class Meta:
        ordering = ['due_date']
    
    def __str__(self):
        return f"Payment #{self.id} - {self.loan.laureate.user.get_full_name()}"
