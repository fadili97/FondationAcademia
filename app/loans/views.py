from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from accounts.permissions import IsAdminUser, IsLaureateUser
from .models import Loan
from .serializers import LoanSerializer, LoanBasicSerializer
from payments.models import Payment
from dateutil.relativedelta import relativedelta

class LoanViewSet(viewsets.ModelViewSet):
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = Loan.objects.all().select_related('laureate__user', 'created_by')
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        laureate_id = self.request.query_params.get('laureate', None)
        if laureate_id:
            queryset = queryset.filter(laureate_id=laureate_id)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(laureate__user__first_name__icontains=search) |
                Q(laureate__user__last_name__icontains=search) |
                Q(laureate__student_id__icontains=search)
            )
        return queryset

    def get_permissions(self):
        if self.action in ['my_loans', 'my_loan_summary']:
            permission_classes = [IsAuthenticated, IsLaureateUser]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return LoanBasicSerializer
        return LoanSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_create(self, serializer):
        loan = serializer.save(created_by=self.request.user)
        # Auto-generate payment schedule
        current_date = loan.start_date
        while current_date <= loan.end_date:
            Payment.objects.create(
                loan=loan,
                amount=loan.monthly_payment,
                due_date=current_date,
                status='pending'
            )
            current_date += relativedelta(months=1)

    @action(detail=False, methods=['get'])
    def my_loans(self, request):
        """Laureate sees only their own loans"""
        if request.user.is_superuser:
            return Response(
                {"error": "Admins don't have loans"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            laureate = request.user.laureate_profile
            loans = Loan.objects.filter(laureate=laureate).order_by('-created_at')
            serializer = LoanSerializer(loans, many=True)
            return Response(serializer.data)
        except:
            return Response(
                {"error": "Laureate profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def my_loan_summary(self, request):
        """Get comprehensive loan summary for laureate dashboard - ALL LOANS"""
        if request.user.is_superuser:
            return Response(
                {"error": "Admins don't have loans"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            laureate = request.user.laureate_profile
            all_loans = Loan.objects.filter(laureate=laureate)
            active_loans = all_loans.filter(status='active')
            if not all_loans.exists():
                return Response({
                    'totalAmount': 0,
                    'remainingBalance': 0,
                    'totalPaid': 0,
                    'nextPaymentDate': None,
                    'nextPaymentAmount': 0,
                    'status': 'no_loan',
                    'loanCount': 0,
                    'activeLoanCount': 0
                })
            total_amount = sum(float(loan.amount) for loan in all_loans)
            total_remaining_balance = sum(float(loan.remaining_balance) for loan in all_loans)
            total_paid = total_amount - total_remaining_balance
            next_payment = Payment.objects.filter(
                loan__in=active_loans,
                status='pending'
            ).order_by('due_date').first()
            if not active_loans.exists():
                overall_status = 'completed'
            elif all_loans.filter(status='overdue').exists():
                overall_status = 'overdue'
            else:
                overall_status = 'active'
            summary = {
                'totalAmount': total_amount,
                'remainingBalance': total_remaining_balance,
                'totalPaid': total_paid,
                'nextPaymentDate': next_payment.due_date if next_payment else None,
                'nextPaymentAmount': float(next_payment.amount) if next_payment else 0,
                'status': overall_status,
                'loanCount': all_loans.count(),
                'activeLoanCount': active_loans.count(),
                'loanBreakdown': {
                    'active': active_loans.count(),
                    'completed': all_loans.filter(status='completed').count(),
                    'overdue': all_loans.filter(status='overdue').count(),
                    'suspended': all_loans.filter(status='suspended').count()
                }
            }
            return Response(summary)
        except Exception as e:
            return Response(
                {"error": f"Error fetching loan summary: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Admin dashboard statistics"""
        stats = {
            'active_loans': Loan.objects.filter(status='active').count(),
            'total_amount': Loan.objects.filter(status='active').aggregate(total=Sum('amount'))['total'] or 0,
            'completed_loans': Loan.objects.filter(status='completed').count(),
            'overdue_loans': Loan.objects.filter(status='overdue').count(),
        }
        return Response(stats)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update loan status"""
        loan = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Loan.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        loan.status = new_status
        loan.save()
        return Response({"message": f"Loan status updated to {new_status}"})