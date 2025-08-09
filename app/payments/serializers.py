# payments/serializers.py
from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    loan_id = serializers.IntegerField(source='loan.id', read_only=True)
    laureate_name = serializers.CharField(source='loan.laureate.user.get_full_name', read_only=True)
    laureate_id = serializers.IntegerField(source='loan.laureate.id', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'loan_id', 'laureate_name', 'laureate_id', 'amount', 
                 'due_date', 'paid_date', 'status', 'payment_method', 
                 'transaction_id', 'notes', 'is_overdue', 'days_overdue',
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        if data.get('paid_date') and data.get('status') != 'completed':
            raise serializers.ValidationError("Paid date can only be set when status is completed")
        
        if data.get('status') == 'completed' and not data.get('paid_date'):
            from django.utils import timezone
            data['paid_date'] = timezone.now().date()
        
        return data

class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating multiple payments for a loan"""
    
    class Meta:
        model = Payment
        fields = ['amount', 'due_date', 'notes']
