from rest_framework import serializers
from .models import Loan
from laureates.models import Laureate
from laureates.serializers import LaureateBasicSerializer

class LoanBasicSerializer(serializers.ModelSerializer):
    laureate_name = serializers.CharField(source='laureate.user.get_full_name', read_only=True)
    remaining_balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Loan
        fields = ['id', 'laureate_name', 'amount', 'remaining_balance',
                  'monthly_payment', 'status', 'start_date', 'end_date']

class LoanSerializer(serializers.ModelSerializer):
    laureate_info = LaureateBasicSerializer(source='laureate', read_only=True)
    laureate_id = serializers.IntegerField(write_only=True, required=False)
    remaining_balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    next_payment_date = serializers.DateField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Loan
        fields = [
            'id', 'laureate_info', 'laureate_id', 'amount', 'interest_rate',
            'start_date', 'end_date', 'monthly_payment', 'status', 'notes',
            'remaining_balance', 'total_paid', 'next_payment_date',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['remaining_balance', 'total_paid', 'next_payment_date', 'created_at', 'updated_at']

    def validate_laureate_id(self, value):
        try:
            Laureate.objects.get(id=value, is_active=True)
        except Laureate.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive laureate.")
        return value

    def validate(self, data):
        # Validate required fields during creation
        if self.instance is None:
            required_fields = ['laureate_id', 'amount', 'start_date', 'end_date', 'monthly_payment']
            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError({field: "This field is required."})

        if 'amount' in data and data['amount'] <= 0:
            raise serializers.ValidationError({"amount": "Loan amount must be positive."})
        if 'start_date' in data and 'end_date' in data:
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError({"end_date": "End date must be after start date."})
        if 'monthly_payment' in data and data['monthly_payment'] <= 0:
            raise serializers.ValidationError({"monthly_payment": "Monthly payment must be positive."})

        # Validate monthly_payment during creation
        if self.instance is None and all(field in data for field in ['amount', 'interest_rate', 'start_date', 'end_date', 'monthly_payment']):
            principal = float(data['amount'])
            annual_rate = float(data['interest_rate']) / 100
            monthly_rate = annual_rate / 12
            start_date = data['start_date']
            end_date = data['end_date']
            months_diff = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
            if months_diff <= 0:
                raise serializers.ValidationError({"end_date": "End date must result in a positive loan term."})
            expected_payment = principal / months_diff if monthly_rate == 0 else \
                (principal * monthly_rate * (1 + monthly_rate) ** months_diff) / ((1 + monthly_rate) ** months_diff - 1)
            if abs(float(data['monthly_payment']) - expected_payment) > 0.01:  # Allow small floating-point differences
                raise serializers.ValidationError({
                    "monthly_payment": f"Monthly payment must be approximately {expected_payment:.2f} based on amount, interest rate, and duration."
                })
        return data

    def update(self, instance, validated_data):
        # Only allow updates to status and notes
        allowed_fields = {'status', 'notes'}
        for field, value in validated_data.items():
            if field not in allowed_fields:
                raise serializers.ValidationError({field: "Cannot update this field after loan creation."})
            setattr(instance, field, value)
        instance.save()
        return instance