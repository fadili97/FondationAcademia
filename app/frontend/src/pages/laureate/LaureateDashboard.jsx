import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, CheckCircle, AlertCircle, User, FileText, Phone, Download } from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';
import { formatCurrency } from '@/utils/currency';



function LaureateDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootPath = location.pathname === '/laureate';
  const [loanInfo, setLoanInfo] = useState({
    totalAmount: 0,
    remainingBalance: 0,
    totalPaid: 0,
    nextPaymentDate: null,
    nextPaymentAmount: 0,
    status: 'no_loan',
    loanCount: 0,
    activeLoanCount: 0,
    loanBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isRootPath) {
      fetchLoanInfo();
    }
  }, [isRootPath]);

  const fetchLoanInfo = async () => {
    try {
      const response = await api.get('/api/loans/loans/my_loan_summary/');
      console.log('Loan summary response:', response.data);
      setLoanInfo(response.data);
    } catch (error) {
      console.error('Error fetching loan info:', error);
      // Set default state on error
      setLoanInfo({
        totalAmount: 0,
        remainingBalance: 0,
        totalPaid: 0,
        nextPaymentDate: null,
        nextPaymentAmount: 0,
        status: 'no_loan',
        loanCount: 0,
        activeLoanCount: 0,
        loanBreakdown: {}
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert payment data to CSV
  const convertToCSV = (payments) => {
    const headers = [
      intl.formatMessage({ id: 'paymentId' }),
      intl.formatMessage({ id: 'loanId' }),
      intl.formatMessage({ id: 'amount' }),
      intl.formatMessage({ id: 'dueDate' }),
      intl.formatMessage({ id: 'status' }),
      intl.formatMessage({ id: 'paymentMethod' }),
      intl.formatMessage({ id: 'transactionId' }),
      intl.formatMessage({ id: 'paidDate' }),
      intl.formatMessage({ id: 'notes' })
    ];
    const csvRows = [headers.join(',')];
    payments.forEach(payment => {
      const row = [
        payment.id || '',
        payment.loan_id || '',
        `"$${payment.amount || 0}"`,
        payment.due_date || '',
        payment.status || '',
        payment.payment_method || '',
        payment.transaction_id || '',
        payment.paid_date || '',
        `"${(payment.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
      ];
      csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
  };

  // Download payment schedule function
  const downloadPaymentSchedule = async () => {
    setDownloading(true);
    try {
      // Fetch the payment schedule data
      const response = await api.get('/api/payments/payments/my_schedule/');
      const payments = response.data;
      if (!payments || payments.length === 0) {
        alert(intl.formatMessage({ id: 'noPaymentSchedule' }));
        return;
      }
      // Convert to CSV format
      const csvContent = convertToCSV(payments);
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payment_schedule_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading payment schedule:', error);
      // Handle specific error cases
      if (error.response?.status === 404) {
        alert(intl.formatMessage({ id: 'noPaymentScheduleFound' }));
      } else if (error.response?.status === 400) {
        alert(intl.formatMessage({ id: 'unableToDownloadSchedule' }));
      } else {
        alert(intl.formatMessage({ id: 'failedToDownloadSchedule' }));
      }
    } finally {
      setDownloading(false);
    }
  };

  // Alternative function to download all payment history (including completed payments)
  const downloadPaymentHistory = async () => {
    setDownloading(true);
    try {
      // Fetch all payment history
      const response = await api.get('/api/payments/payments/my_payments/');
      const payments = response.data;
      if (!payments || payments.length === 0) {
        alert(intl.formatMessage({ id: 'noPaymentHistory' }));
        return;
      }
      // Convert to CSV format
      const csvContent = convertToCSV(payments);
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payment_history_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading payment history:', error);
      alert(intl.formatMessage({ id: 'failedToDownloadSchedule' }));
    } finally {
      setDownloading(false);
    }
  };

  if (!isRootPath) {
    return <Outlet />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'overdue': return 'text-red-600';
      case 'completed': return 'text-blue-600';
      case 'no_loan': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'overdue': return AlertCircle;
      case 'completed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const getStatusText = (status) => {
    return intl.formatMessage({ id: `${status}Status` });
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {intl.formatMessage({ id: 'welcomeToDashboard' })}
        </h2>
        <p className="text-gray-600 mt-2">
          {intl.formatMessage({ id: 'trackScholarshipLoans' })}
          {loanInfo.loanCount > 0 && (
            <span className="ml-2 text-sm font-medium">
              {intl.formatMessage(
                { id: 'loanCount' },
                { count: loanInfo.loanCount, plural: loanInfo.loanCount !== 1 ? 's' : '' }
              )}
            </span>
          )}
        </p>
      </div>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : loanInfo.status === 'no_loan' ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {intl.formatMessage({ id: 'noLoansYet' })}
            </h3>
            <p className="text-gray-500 mb-4">
              {intl.formatMessage({ id: 'noLoansDescription' })}
            </p>
            <Button variant="outline">
              {intl.formatMessage({ id: 'contactSupport' })}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {intl.formatMessage({ id: 'totalLoanAmount' })}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
<div className="text-2xl font-bold">{formatCurrency(loanInfo.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {loanInfo.loanCount > 1
                  ? intl.formatMessage({ id: 'acrossLoans' }, { count: loanInfo.loanCount })
                  : intl.formatMessage({ id: 'originalLoanAmount' })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {intl.formatMessage({ id: 'remainingBalance' })}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
<div className="text-2xl font-bold text-orange-600">{formatCurrency(loanInfo.remainingBalance)}</div>              <p className="text-xs text-muted-foreground">
                {intl.formatMessage({ id: 'amountLeftToPay' })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {intl.formatMessage({ id: 'nextPayment' })}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
<div className="text-2xl font-bold">{formatCurrency(loanInfo.nextPaymentAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {intl.formatMessage(
                  { id: 'dueDate' },
                  { date: loanInfo.nextPaymentDate ? new Date(loanInfo.nextPaymentDate).toLocaleDateString(intl.locale) : intl.formatMessage({ id: 'notApplicable' }) }
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {intl.formatMessage({ id: 'overallStatus' })}
              </CardTitle>
              {(() => {
                const StatusIcon = getStatusIcon(loanInfo.status);
                return <StatusIcon className={`h-4 w-4 ${getStatusColor(loanInfo.status)}`} />;
              })()}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold capitalize ${getStatusColor(loanInfo.status)}`}>
                {getStatusText(loanInfo.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {loanInfo.activeLoanCount > 0
                  ? intl.formatMessage(
                      { id: 'activeLoanCount' },
                      { count: loanInfo.activeLoanCount, plural: loanInfo.activeLoanCount !== 1 ? 's' : '' }
                    )
                  : intl.formatMessage({ id: 'currentStatus' })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Only show detailed info if loans exist */}
      {loanInfo.status !== 'no_loan' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{intl.formatMessage({ id: 'paymentProgress' })}</CardTitle>
              <CardDescription>{intl.formatMessage({ id: 'yourRepaymentJourney' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loanInfo.totalAmount > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{intl.formatMessage({ id: 'progress' })}</span>
                      <span>
                        {Math.round((loanInfo.totalPaid / loanInfo.totalAmount) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.round((loanInfo.totalPaid / loanInfo.totalAmount) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>{intl.formatMessage({ id: 'paid' }, { amount: loanInfo.totalPaid?.toLocaleString() })}</span>
                      <span>{intl.formatMessage({ id: 'remaining' }, { amount: loanInfo.remainingBalance?.toLocaleString() })}</span>
                    </div>
                  </div>
                )}
                {/* Loan breakdown if multiple loans */}
                {loanInfo.loanCount > 1 && loanInfo.loanBreakdown && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">{intl.formatMessage({ id: 'loanBreakdown' })}</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {loanInfo.loanBreakdown.active > 0 && (
                        <div className="flex justify-between">
                          <span>{intl.formatMessage({ id: 'active' })}:</span>
                          <span className="font-medium text-green-600">{loanInfo.loanBreakdown.active}</span>
                        </div>
                      )}
                      {loanInfo.loanBreakdown.completed > 0 && (
                        <div className="flex justify-between">
                          <span>{intl.formatMessage({ id: 'completed' })}:</span>
                          <span className="font-medium text-blue-600">{loanInfo.loanBreakdown.completed}</span>
                        </div>
                      )}
                      {loanInfo.loanBreakdown.overdue > 0 && (
                        <div className="flex justify-between">
                          <span>{intl.formatMessage({ id: 'overdue' })}:</span>
                          <span className="font-medium text-red-600">{loanInfo.loanBreakdown.overdue}</span>
                        </div>
                      )}
                      {loanInfo.loanBreakdown.suspended > 0 && (
                        <div className="flex justify-between">
                          <span>{intl.formatMessage({ id: 'suspended' })}:</span>
                          <span className="font-medium text-gray-600">{loanInfo.loanBreakdown.suspended}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{intl.formatMessage({ id: 'quickActions' })}</CardTitle>
              <CardDescription>{intl.formatMessage({ id: 'manageYourAccount' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => navigate('/laureate/repayments')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{intl.formatMessage({ id: 'viewPaymentSchedule' })}</div>
                    <div className="text-xs text-muted-foreground">{intl.formatMessage({ id: 'seeUpcomingPayments' })}</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => navigate('/laureate/loans')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{intl.formatMessage({ id: 'viewLoanHistory' })}</div>
                    <div className="text-xs text-muted-foreground">{intl.formatMessage({ id: 'seeAllYourLoans' })}</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => navigate('/laureate/profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{intl.formatMessage({ id: 'updateProfile' })}</div>
                    <div className="text-xs text-muted-foreground">{intl.formatMessage({ id: 'managePersonalInformation' })}</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={downloadPaymentSchedule}
                  disabled={downloading}
                >
                  <Download className={`h-4 w-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
                  <div className="text-left">
                    <div className="font-medium">
                      {downloading ? intl.formatMessage({ id: 'downloading' }) : intl.formatMessage({ id: 'downloadSchedule' })}
                    </div>
                    <div className="text-xs text-muted-foreground">{intl.formatMessage({ id: 'exportPaymentPlan' })}</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={downloadPaymentHistory}
                  disabled={downloading}
                >
                  <FileText className={`h-4 w-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
                  <div className="text-left">
                    <div className="font-medium">
                      {downloading ? intl.formatMessage({ id: 'downloading' }) : intl.formatMessage({ id: 'downloadHistory' })}
                    </div>
                    <div className="text-xs text-muted-foreground">{intl.formatMessage({ id: 'exportAllPayments' })}</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Overdue Alert */}
      {loanInfo.status === 'overdue' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {intl.formatMessage({ id: 'paymentOverdue' })}
            </CardTitle>
            <CardDescription className="text-red-600">
              {intl.formatMessage({ id: 'overdueAlertDescription' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-red-600 text-white hover:bg-red-700">
              <Phone className="h-4 w-4 mr-2" />
              {intl.formatMessage({ id: 'contactFinanceOffice' })}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LaureateDashboard;