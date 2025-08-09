from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, Sum
from accounts.permissions import IsAdminUser, IsLaureateUser
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer
from loans.models import Loan
from dateutil.relativedelta import relativedelta

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('loan__laureate__user')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_permissions(self):
        if self.action in ['my_payments', 'my_schedule']:
            permission_classes = [IsAuthenticated, IsLaureateUser]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Payment.objects.all().select_related('loan__laureate__user')
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        loan_id = self.request.query_params.get('loan', None)
        if loan_id:
            queryset = queryset.filter(loan_id=loan_id)
        laureate_id = self.request.query_params.get('laureate', None)
        if laureate_id:
            queryset = queryset.filter(loan__laureate_id=laureate_id)
        overdue = self.request.query_params.get('overdue', None)
        if overdue == 'true':
            queryset = queryset.filter(
                status='pending',
                due_date__lt=timezone.now().date()
            )
        return queryset

    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Laureate sees only their own payment history"""
        if request.user.is_superuser:
            return Response(
                {"error": "Admins don't have payments"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            laureate = request.user.laureate_profile
            payments = Payment.objects.filter(
                loan__laureate=laureate
            ).select_related('loan').order_by('-due_date')
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data)
        except:
            return Response(
                {"error": "Laureate profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def my_schedule(self, request):
        """Laureate sees only their own repayment schedule"""
        if request.user.is_superuser:
            return Response(
                {"error": "Admins don't have payment schedules"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            laureate = request.user.laureate_profile
            payments = Payment.objects.filter(
                loan__laureate=laureate,
                loan__status='active'
            ).select_related('loan').order_by('due_date')
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data)
        except:
            return Response(
                {"error": "Laureate profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Admin sees all overdue payments"""
        from django.utils import timezone
        
        # Get ALL overdue payments (both pending past due date AND already marked as overdue)
        today = timezone.now().date()
        
        overdue_payments = Payment.objects.filter(
            Q(status='pending', due_date__lt=today) |  # Pending past due date
            Q(status='overdue')                        # Already marked as overdue
        ).select_related('loan__laureate__user').order_by('due_date')
        
        serializer = PaymentSerializer(overdue_payments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Admin payment statistics"""
        today = timezone.now().date()
        stats = {
            'overdue_payments': Payment.objects.filter(
                status__in=['pending', 'overdue'],
                due_date__lt=today
            ).count(),
            'pending_payments': Payment.objects.filter(status='pending').count(),
            'completed_payments': Payment.objects.filter(status='completed').count(),
            'total_collected': Payment.objects.filter(
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0,
        }
        return Response(stats)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark a payment as completed"""
        payment = self.get_object()
        payment.status = 'completed'
        payment.paid_date = timezone.now().date()
        payment.payment_method = request.data.get('payment_method', '')
        payment.transaction_id = request.data.get('transaction_id', '')
        payment.notes = request.data.get('notes', payment.notes)
        payment.save()
        loan = payment.loan
        if loan.remaining_balance <= 0:
            loan.status = 'completed'
            loan.save()
        return Response({"message": "Payment marked as completed"})

    @action(detail=True, methods=['post'])
    def mark_missed(self, request, pk=None):
        """Mark a payment as missed"""
        payment = self.get_object()
        payment.status = 'missed'
        payment.notes = request.data.get('notes', payment.notes)
        payment.save()
        return Response({"message": "Payment marked as missed"})

    @action(detail=False, methods=['post'])
    def generate_schedule(self, request):
        """Generate payment schedule for a loan"""
        loan_id = request.data.get('loan_id')
        try:
            loan = Loan.objects.get(id=loan_id)
            if loan.total_paid > 0:
                return Response(
                    {"error": "Cannot regenerate payment schedule after payments are recorded"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            Payment.objects.filter(loan=loan).delete()
            principal = float(loan.amount)
            annual_rate = float(loan.interest_rate) / 100
            monthly_rate = annual_rate / 12
            start_date = loan.start_date
            end_date = loan.end_date
            months_diff = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
            if months_diff <= 0:
                return Response(
                    {"error": "End date must be after start date"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            monthly_payment = float(loan.monthly_payment)
            current_date = start_date
            payments_created = 0
            while current_date <= end_date:
                Payment.objects.create(
                    loan=loan,
                    amount=monthly_payment,
                    due_date=current_date,
                    status='pending'
                )
                current_date += relativedelta(months=1)
                payments_created += 1
            return Response({
                "message": f"Generated {payments_created} payments for loan #{loan.id}"
            })
        except Loan.DoesNotExist:
            return Response(
                {"error": "Loan not found"},
                status=status.HTTP_404_NOT_FOUND
            )