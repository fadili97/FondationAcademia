# administration/viewsets.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from accounts.permissions import IsAdminUser
from laureates.models import Laureate
from loans.models import Loan
from payments.models import Payment
from .models import ActivityLog, Report
from .serializers import ActivityLogSerializer, ReportSerializer, ReportCreateSerializer

from django.http import StreamingHttpResponse
import csv
from io import StringIO
from django.core.exceptions import ObjectDoesNotExist

class DashboardViewSet(viewsets.ViewSet):
    """Admin dashboard data - superuser only"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Dashboard statistics for admins only"""
        today = timezone.now().date()
        
        stats = {
            'totalLaureates': Laureate.objects.filter(is_active=True).count(),
            'activeLoans': Loan.objects.filter(status='active').count(),
            'overduePayments': Payment.objects.filter(
                status__in=['pending', 'overdue'],
                due_date__lt=today
            ).count(),
            'totalAmount': Loan.objects.filter(status='active').aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'totalCollected': Payment.objects.filter(status='completed').aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'pendingAmount': Payment.objects.filter(status='pending').aggregate(
                total=Sum('amount')
            )['total'] or 0,
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Get recent activity logs"""
        activities = ActivityLog.objects.all()[:20]
        serializer = ActivityLogSerializer(activities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly_trends(self, request):
        """Get monthly trends for charts"""
        # Get data for the last 12 months
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=365)
        
        # Monthly loan creation trends
        loans_by_month = []
        payments_by_month = []
        current_date = start_date.replace(day=1)
        
        while current_date <= end_date:
            next_month = current_date.replace(month=current_date.month + 1) if current_date.month < 12 else current_date.replace(year=current_date.year + 1, month=1)
            
            loans_count = Loan.objects.filter(
                created_at__date__gte=current_date,
                created_at__date__lt=next_month
            ).count()
            
            payments_amount = Payment.objects.filter(
                paid_date__gte=current_date,
                paid_date__lt=next_month,
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            loans_by_month.append({
                'month': current_date.strftime('%Y-%m'),
                'count': loans_count
            })
            
            payments_by_month.append({
                'month': current_date.strftime('%Y-%m'),
                'amount': float(payments_amount)
            })
            
            current_date = next_month
        
        trends = {
            'loans_created': loans_by_month,
            'payments_collected': payments_by_month,
        }
        
        return Response(trends)

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Activity logs - Admin only"""
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = ActivityLog.objects.all()
        
        # Filter by action
        action = self.request.query_params.get('action', None)
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by user
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if date_from:
            queryset = queryset.filter(timestamp__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__date__lte=date_to)
        
        return queryset

class ReportViewSet(viewsets.ModelViewSet):
    """Reports management - Admin only"""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReportCreateSerializer
        return ReportSerializer
    
    def get_queryset(self):
        queryset = Report.objects.all()
        
        # Filter by report type
        report_type = self.request.query_params.get('type', None)
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate_financial(self, request):
        """Generate financial report"""
        date_from = request.data.get('date_from')
        date_to = request.data.get('date_to')
        if not date_from or not date_to:
            return Response(
                {"error": "date_from and date_to are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate financial report data
        financial_data = {
            'total_loans': Loan.objects.filter(
                created_at__date__range=[date_from, date_to]
            ).aggregate(
                count=Count('id'),
                total_amount=Sum('amount')
            ),
            'total_payments': Payment.objects.filter(
                paid_date__range=[date_from, date_to],
                status='completed'
            ).aggregate(
                count=Count('id'),
                total_amount=Sum('amount')
            ),
            'overdue_payments': Payment.objects.filter(
                due_date__range=[date_from, date_to],
                status__in=['overdue', 'missed']
            ).aggregate(
                count=Count('id'),
                total_amount=Sum('amount')
            ),
        }

        # Convert Decimal values to float for JSON serialization
        for key in financial_data:
            if financial_data[key]['total_amount'] is not None:
                financial_data[key]['total_amount'] = float(financial_data[key]['total_amount'])

        # Create report record without file_path
        report = Report.objects.create(
            title=f"Financial Report {date_from} to {date_to}",
            report_type='financial',
            generated_by=request.user,
            date_from=date_from,
            date_to=date_to,
            parameters=financial_data,
            file_path=''  # Optional: leave empty or omit if not needed
        )
        serializer = ReportSerializer(report)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def generate_overdue(self, request):
        """Generate overdue payments report"""
        overdue_payments = Payment.objects.filter(
            status__in=['overdue', 'missed']
        ).select_related('loan__laureate__user')
        overdue_data = []
        for payment in overdue_payments:
            overdue_data.append({
                'payment_id': payment.id,
                'laureate_name': payment.loan.laureate.user.get_full_name(),
                'amount': float(payment.amount),  # Convert Decimal to float
                'due_date': payment.due_date.isoformat(),  # Convert date to ISO string
                'days_overdue': payment.days_overdue,
                'loan_id': payment.loan.id
            })

        # Create report record
        report = Report.objects.create(
            title=f"Overdue Payments Report - {timezone.now().date()}",
            report_type='overdue',
            generated_by=request.user,
            date_from=timezone.now().date() - timedelta(days=365),
            date_to=timezone.now().date(),
            parameters={'overdue_payments': overdue_data}
        )
        serializer = ReportSerializer(report)
        return Response(serializer.data)
        

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a report as a CSV file"""
        try:
            report = self.get_object()
            report_type = report.report_type
            parameters = report.parameters

            # Create a StringIO buffer to write CSV data
            buffer = StringIO()
            writer = csv.writer(buffer)

            if report_type == 'financial':
                # Write CSV headers and data for financial report
                writer.writerow(['Metric', 'Count', 'Total Amount'])
                writer.writerow(['Total Loans', 
                            parameters.get('total_loans', {}).get('count', 0),
                            parameters.get('total_loans', {}).get('total_amount', 0)])
                writer.writerow(['Total Payments', 
                            parameters.get('total_payments', {}).get('count', 0),
                            parameters.get('total_payments', {}).get('total_amount', 0)])
                writer.writerow(['Overdue Payments', 
                            parameters.get('overdue_payments', {}).get('count', 0),
                            parameters.get('overdue_payments', {}).get('total_amount', 0)])
                filename = f"financial_report_{report.date_from}_to_{report.date_to}.csv"

            elif report_type == 'overdue':
                # Write CSV headers and data for overdue report
                writer.writerow(['Payment ID', 'Laureate Name', 'Amount', 'Due Date', 'Days Overdue', 'Loan ID'])
                for payment in parameters.get('overdue_payments', []):
                    writer.writerow([
                        payment.get('payment_id', ''),
                        payment.get('laureate_name', ''),
                        payment.get('amount', 0),
                        payment.get('due_date', ''),
                        payment.get('days_overdue', 0),
                        payment.get('loan_id', '')
                    ])
                filename = f"overdue_report_{report.created_at.strftime('%Y%m%d_%H%M%S')}.csv"

            else:
                return Response(
                    {"error": f"Download not supported for report type: {report_type}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Prepare streaming response
            buffer.seek(0)
            response = StreamingHttpResponse(
                buffer,
                content_type='text/csv'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except ObjectDoesNotExist:
            return Response(
                {"error": "Report not found"},
                status=status.HTTP_404_NOT_FOUND
            )