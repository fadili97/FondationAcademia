import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Clock } from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';
import { formatCurrency } from '@/utils/currency';



function RepaymentSchedule() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/api/payments/payments/my_schedule/');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      case 'missed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'pending': return '○';
      case 'overdue': return '⚠';
      case 'missed': return '✗';
      default: return '○';
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {intl.formatMessage({ id: 'repaymentSchedule' })}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          {intl.formatMessage({ id: 'trackPaymentSchedule' })}
        </p>
      </div>
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <DollarSign className="h-5 w-5 mr-2" />
            {intl.formatMessage({ id: 'paymentSummary' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">{intl.formatMessage({ id: 'completedPayments' })}</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {payments.filter(p => p.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">{intl.formatMessage({ id: 'pendingPayments' })}</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {payments.filter(p => p.status === 'overdue').length}
              </p>
              <p className="text-sm text-muted-foreground">{intl.formatMessage({ id: 'overduePayments' })}</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-muted-foreground">
  {formatCurrency(payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}
</p>
              <p className="text-sm text-muted-foreground">{intl.formatMessage({ id: 'totalPaid' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Payment Schedule */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <span className="text-muted-foreground text-sm sm:text-base">
              {intl.formatMessage({ id: 'loadingPaymentSchedule' })}
            </span>
          </CardContent>
        </Card>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <span className="text-muted-foreground text-sm sm:text-base">
              {intl.formatMessage({ id: 'noPaymentSchedule' })}
            </span>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Calendar className="h-5 w-5 mr-2" />
              {intl.formatMessage({ id: 'paymentSchedule' })} ({intl.formatMessage({ id: 'paymentsCount' }, { count: payments.length })})
            </CardTitle>
            <CardDescription className="text-sm">{intl.formatMessage({ id: 'paymentScheduleDesc' })}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile: Card-based layout */}
            <div className="block sm:hidden space-y-4 p-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{intl.formatMessage({ id: 'status' })}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(payment.status)}</span>
                          <Badge variant={getStatusColor(payment.status)}>{intl.formatMessage({ id: `${payment.status}Status` })}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{intl.formatMessage({ id: 'paymentNumber' })}</span>
                        <span className="font-mono text-sm">#{payment.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{intl.formatMessage({ id: 'amount' })}</span>
<span className="font-bold">{formatCurrency(payment.amount)}</span>                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{intl.formatMessage({ id: 'dueDate' })}</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(payment.due_date).toLocaleDateString(intl.locale)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{intl.formatMessage({ id: 'paidDate' })}</span>
                        {payment.paid_date ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{new Date(payment.paid_date).toLocaleDateString(intl.locale)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">{intl.formatMessage({ id: 'notAvailable' })}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{intl.formatMessage({ id: 'paymentMethod' })}</span>
                        <span className="text-sm">{payment.payment_method || intl.formatMessage({ id: 'notAvailable' })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Desktop: Table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">{intl.formatMessage({ id: 'status' })}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">{intl.formatMessage({ id: 'paymentNumber' })}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">{intl.formatMessage({ id: 'amount' })}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">{intl.formatMessage({ id: 'dueDate' })}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">{intl.formatMessage({ id: 'paidDate' })}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">{intl.formatMessage({ id: 'paymentMethod' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(payment.status)}</span>
                          <Badge variant={getStatusColor(payment.status)}>{intl.formatMessage({ id: `${payment.status}Status` })}</Badge>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm">#{payment.id}</td>
                     <td className="p-4 font-bold">{formatCurrency(payment.amount)}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(payment.due_date).toLocaleDateString(intl.locale)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {payment.paid_date ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span>{new Date(payment.paid_date).toLocaleDateString(intl.locale)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{intl.formatMessage({ id: 'notAvailable' })}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {payment.payment_method || <span className="text-muted-foreground">{intl.formatMessage({ id: 'notAvailable' })}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RepaymentSchedule;