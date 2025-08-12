import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Filter,
  Eye,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';
import { formatCurrency } from '@/utils/currency';

function PaymentManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loanId = searchParams.get('loan');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [loanId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/api/payments/payments/';
      const params = new URLSearchParams();
      if (loanId) {
        params.append('loan', loanId);
      }
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await api.get(url);
      const data = response.data?.results || response.data || [];
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(intl.formatMessage({ id: 'failedToLoadPayments' }));
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (paymentId) => {
    try {
      setActionLoading(paymentId);
      await api.post(`/api/payments/payments/${paymentId}/mark_paid/`, {
        payment_method: 'Manual',
        notes: 'Marked as paid by admin'
      });
      setSuccess(intl.formatMessage({ id: 'paymentMarkedCompleted' }));
      fetchPayments(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      setError(intl.formatMessage({ id: 'failedToMarkPaid' }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkMissed = async (paymentId) => {
    try {
      setActionLoading(paymentId);
      await api.post(`/api/payments/payments/${paymentId}/mark_missed/`, {
        notes: 'Marked as missed by admin'
      });
      setSuccess(intl.formatMessage({ id: 'paymentMarkedMissed' }));
      fetchPayments(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error marking payment as missed:', error);
      setError(intl.formatMessage({ id: 'failedToMarkMissed' }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleBack = () => {
    if (loanId) {
      navigate(`/dashbaord/admin/loans/${loanId}/edit`);
    } else {
      navigate('/dashboard/admin/loans');
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

  const getStatusIcon = (payment) => {
    switch (payment.status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'missed': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.laureate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id?.toString().includes(searchTerm);
    const matchesFilter =
      filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    overdue: payments.filter(p => p.status === 'overdue').length,
    missed: payments.filter(p => p.status === 'missed').length,
    totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    completedAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={handleBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {loanId
              ? intl.formatMessage({ id: 'paymentManagementLoan' }, { loanId })
              : intl.formatMessage({ id: 'paymentManagement' })}
          </h1>
          <p className="text-muted-foreground">
            {loanId
              ? intl.formatMessage({ id: 'manageLoanPayments' })
              : intl.formatMessage({ id: 'manageAllPayments' })}
          </p>
        </div>
      </div>
      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'totalPayments' })}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'completedPayments' })}
                </p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'pendingPayments' })}
                </p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'overduePayments' })}
                </p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>{intl.formatMessage({ id: 'searchAndFilter' })}</CardTitle>
          <CardDescription>{intl.formatMessage({ id: 'findPayments' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={intl.formatMessage({ id: 'searchPaymentsPlaceholder' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                <Filter className="h-4 w-4 mr-1" />
                {intl.formatMessage({ id: 'allFilter' })} ({stats.total})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                {intl.formatMessage({ id: 'pendingFilter' })} ({stats.pending})
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                {intl.formatMessage({ id: 'completedFilter' })} ({stats.completed})
              </Button>
              <Button
                variant={filterStatus === 'overdue' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('overdue')}
              >
                {intl.formatMessage({ id: 'overdueFilter' })} ({stats.overdue})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {intl.formatMessage({ id: 'payments' })} ({filteredPayments.length})
          </CardTitle>
          <CardDescription>
            {searchTerm
              ? intl.formatMessage({ id: 'showingResultsFor' }, { searchTerm })
              : loanId
                ? intl.formatMessage({ id: 'allPaymentsForLoan' }, { loanId })
                : intl.formatMessage({ id: 'allPayments' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">
                  {intl.formatMessage({ id: 'loadingPayments' })}
                </span>
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {intl.formatMessage({ id: 'noPaymentsFound' })}
              </p>
              <p className="text-sm">
                {searchTerm
                  ? intl.formatMessage({ id: 'adjustSearchCriteria' })
                  : loanId
                    ? intl.formatMessage({ id: 'noPaymentsForLoan' })
                    : intl.formatMessage({ id: 'noPaymentsInSystem' })}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'paymentId' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'laureate' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'amount' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'dueDate' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                      {intl.formatMessage({ id: 'paidDate' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'status' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'actions' })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          #{payment.id}
                        </code>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{payment.laureate_name}</div>
                      </td>
                      <td className="p-4">
<div className="font-bold">{formatCurrency(payment.amount)}</div>                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{new Date(payment.due_date).toLocaleDateString(intl.locale)}</span>
                        </div>
                        {payment.is_overdue && (
                          <div className="text-xs text-red-600">
                            {intl.formatMessage({ id: 'daysOverdue' }, { days: payment.days_overdue })}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm hidden md:table-cell">
                        {payment.paid_date ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{new Date(payment.paid_date).toLocaleDateString(intl.locale)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{intl.formatMessage({ id: 'notAvailable' })}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment)}
                          <Badge variant={getStatusColor(payment.status)}>
                            {intl.formatMessage({ id: `${payment.status}Status` })}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          {payment.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkPaid(payment.id)}
                                className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                disabled={actionLoading === payment.id}
                                title={intl.formatMessage({ id: 'markAsPaid' })}
                              >
                                {actionLoading === payment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkMissed(payment.id)}
                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={actionLoading === payment.id}
                                title={intl.formatMessage({ id: 'markAsMissed' })}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {/* Commented out Eye button */}
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>{intl.formatMessage({ id: 'paymentSummary' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{intl.formatMessage({ id: 'totalPaymentAmount' })}:</span>
<span className="font-bold">{formatCurrency(stats.totalAmount)}</span>              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">{intl.formatMessage({ id: 'amountCollected' })}:</span>
<span className="font-bold text-green-600">{formatCurrency(stats.completedAmount)}</span>              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">{intl.formatMessage({ id: 'outstandingAmount' })}:</span>
<span className="font-bold text-orange-600">{formatCurrency(stats.totalAmount - stats.completedAmount)}</span>              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{intl.formatMessage({ id: 'collectionRate' })}:</span>
                <span className="font-bold">
                  {stats.totalAmount > 0 ? Math.round((stats.completedAmount / stats.totalAmount) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${stats.totalAmount > 0 ? (stats.completedAmount / stats.totalAmount) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentManagement;