# laureates/models.py
from django.db import models
from accounts.models import User

class Laureate(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='laureate_profile')
    student_id = models.CharField(max_length=50, unique=True)
    institution = models.CharField(max_length=200, blank=True)
    field_of_study = models.CharField(max_length=200, blank=True)
    graduation_year = models.IntegerField()
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Ensure the linked user is not a superuser
        if self.user.is_superuser:
            raise ValueError("Superusers cannot have laureate profiles")
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"
    
    class Meta:
        ordering = ['-created_at']
