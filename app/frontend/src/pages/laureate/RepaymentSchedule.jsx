import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, XCircle, CircleDot } from 'lucide-react';
import { intl } from '@/i18n';
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
      case 'completed': return CheckCircle;
      case 'pending': return CircleDot;
      case 'overdue': return AlertCircle;
      case 'missed': return XCircle;
      default: return CircleDot;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'pending': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'overdue': return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      case 'missed': return 'bg-muted border-border';
      default: return 'bg-muted border-border';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
        {/* Loading Header */}
        <div className="space-y-2">
          <div className="h-8 sm:h-10 bg-muted rounded w-56 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-72 animate-pulse"></div>
        </div>
        
        {/* Loading Summary */}
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-40"></div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-8 bg-muted rounded w-12 mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading Payment Cards */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
      {/* Header Section - Mobile Optimized */}
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          {intl.formatMessage({ id: 'repaymentSchedule' })}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {intl.formatMessage({ id: 'trackPaymentSchedule' })}
        </p>
      </div>

      {/* Payment Summary - Mobile Responsive */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {intl.formatMessage({ id: 'paymentSummary' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                {payments.filter(p => p.status === 'completed').length}
              </p>
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium mt-1">
                {intl.formatMessage({ id: 'completedPayments' })}
              </p>
            </div>
            
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {payments.filter(p => p.status === 'pending').length}
              </p>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium mt-1">
                {intl.formatMessage({ id: 'pendingPayments' })}
              </p>
            </div>
            
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                {payments.filter(p => p.status === 'overdue').length}
              </p>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium mt-1">
                {intl.formatMessage({ id: 'overduePayments' })}
              </p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg border border-border col-span-2 lg:col-span-1">
              <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                {formatCurrency(payments
                  .filter(p => p.status === 'completed')
                  .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                {intl.formatMessage({ id: 'totalPaid' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      {payments.length === 0 ? (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
              {intl.formatMessage({ id: 'noPaymentSchedule' })}
            </h3>
            <p className="text-sm text-muted-foreground">
              Your payment schedule will appear here once loans are activated.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="truncate">
                {intl.formatMessage({ id: 'paymentSchedule' })}
              </span>
              <Badge variant="outline" className="ml-2 hidden sm:inline-flex">
                {intl.formatMessage({ id: 'paymentsCount' }, { count: payments.length })}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm">
              {intl.formatMessage({ id: 'paymentScheduleDesc' })}
            </CardDescription>
            {/* Mobile Badge */}
            <div className="sm:hidden">
              <Badge variant="outline" className="text-xs">
                {intl.formatMessage({ id: 'paymentsCount' }, { count: payments.length })}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Mobile: Enhanced Card Layout */}
            <div className="block lg:hidden space-y-3 p-3 sm:p-4">
              {payments.map((payment, index) => {
                const StatusIcon = getStatusIcon(payment.status);
                return (
                  <Card key={payment.id} className={`border ${getStatusBgColor(payment.status)} transition-all duration-200 hover:shadow-md`}>
                    <CardContent className="p-4">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-background border-2 border-current flex items-center justify-center">
                            <span className="text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="font-mono text-sm text-muted-foreground">#{payment.id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge variant={getStatusColor(payment.status)} className="text-xs">
                            {intl.formatMessage({ id: `${payment.status}Status` })}
                          </Badge>
                        </div>
                      </div>

                      {/* Amount - Prominent Display */}
                      <div className="text-center py-2 mb-3 bg-background/70 rounded-lg">
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">Payment Amount</p>
                      </div>

                      {/* Payment Details Grid */}
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-sm">
                        <div className="flex items-center justify-between sm:flex-col sm:items-start sm:space-y-1">
                          <span className="font-medium text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {intl.formatMessage({ id: 'dueDate' })}
                          </span>
                          <span className="text-foreground font-semibold sm:text-base">
                            {new Date(payment.due_date).toLocaleDateString(intl.locale)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between sm:flex-col sm:items-start sm:space-y-1">
                          <span className="font-medium text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {intl.formatMessage({ id: 'paidDate' })}
                          </span>
                          {payment.paid_date ? (
                            <span className="text-green-600 dark:text-green-400 font-semibold sm:text-base">
                              {new Date(payment.paid_date).toLocaleDateString(intl.locale)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">
                              {intl.formatMessage({ id: 'notAvailable' })}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between sm:flex-col sm:items-start sm:space-y-1 sm:col-span-2">
                          <span className="font-medium text-muted-foreground">
                            {intl.formatMessage({ id: 'paymentMethod' })}
                          </span>
                          <span className="text-foreground text-sm">
                            {payment.payment_method || intl.formatMessage({ id: 'notAvailable' })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Desktop: Enhanced Table Layout */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">#</th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">{intl.formatMessage({ id: 'status' })}</th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">{intl.formatMessage({ id: 'amount' })}</th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">{intl.formatMessage({ id: 'dueDate' })}</th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">{intl.formatMessage({ id: 'paidDate' })}</th>
                    <th className="text-left p-4 font-semibold text-foreground text-sm">{intl.formatMessage({ id: 'paymentMethod' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => {
                    const StatusIcon = getStatusIcon(payment.status);
                    return (
                      <tr key={payment.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                            </div>
                            <span className="font-mono text-sm text-muted-foreground">#{payment.id}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge variant={getStatusColor(payment.status)}>
                              {intl.formatMessage({ id: `${payment.status}Status` })}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-lg text-foreground">{formatCurrency(payment.amount)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {new Date(payment.due_date).toLocaleDateString(intl.locale)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {payment.paid_date ? (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-green-500" />
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                {new Date(payment.paid_date).toLocaleDateString(intl.locale)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{intl.formatMessage({ id: 'notAvailable' })}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-foreground">
                            {payment.payment_method || (
                              <span className="text-muted-foreground">{intl.formatMessage({ id: 'notAvailable' })}</span>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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