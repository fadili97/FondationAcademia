import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, CheckCircle, AlertCircle, User, FileText, Phone, Download } from 'lucide-react';
import { intl } from '@/i18n';
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
      const response = await api.get('/api/payments/payments/my_schedule/');
      const payments = response.data;
      if (!payments || payments.length === 0) {
        alert(intl.formatMessage({ id: 'noPaymentSchedule' }));
        return;
      }
      const csvContent = convertToCSV(payments);
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

  // Download payment history function
  const downloadPaymentHistory = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/api/payments/payments/my_payments/');
      const payments = response.data;
      if (!payments || payments.length === 0) {
        alert(intl.formatMessage({ id: 'noPaymentHistory' }));
        return;
      }
      const csvContent = convertToCSV(payments);
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
      {/* Header Section - Mobile Optimized */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {intl.formatMessage({ id: 'welcomeToDashboard' })}
        </h2>
        <div className="space-y-1">
          <p className="text-sm sm:text-base text-gray-600">
            {intl.formatMessage({ id: 'trackScholarshipLoans' })}
          </p>
          {loanInfo.loanCount > 0 && (
            <span className="inline-block text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              {intl.formatMessage(
                { id: 'loanCount' },
                { count: loanInfo.loanCount, plural: loanInfo.loanCount !== 1 ? 's' : '' }
              )}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        /* Loading State - Mobile Responsive Grid */
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24 sm:w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : loanInfo.status === 'no_loan' ? (
        /* No Loans State - Mobile Optimized */
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <CreditCard className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {intl.formatMessage({ id: 'noLoansYet' })}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 max-w-md mx-auto">
              {intl.formatMessage({ id: 'noLoansDescription' })}
            </p>
            <Button variant="outline" className="w-full sm:w-auto">
              {intl.formatMessage({ id: 'contactSupport' })}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Loan Info Cards - Mobile Responsive Grid */
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {intl.formatMessage({ id: 'totalLoanAmount' })}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(loanInfo.totalAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {loanInfo.loanCount > 1
                  ? intl.formatMessage({ id: 'acrossLoans' }, { count: loanInfo.loanCount })
                  : intl.formatMessage({ id: 'originalLoanAmount' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {intl.formatMessage({ id: 'remainingBalance' })}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(loanInfo.remainingBalance)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {intl.formatMessage({ id: 'amountLeftToPay' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {intl.formatMessage({ id: 'nextPayment' })}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(loanInfo.nextPaymentAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {intl.formatMessage(
                  { id: 'dueDate' },
                  { date: loanInfo.nextPaymentDate ? new Date(loanInfo.nextPaymentDate).toLocaleDateString(intl.locale) : intl.formatMessage({ id: 'notApplicable' }) }
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {intl.formatMessage({ id: 'overallStatus' })}
              </CardTitle>
              {(() => {
                const StatusIcon = getStatusIcon(loanInfo.status);
                return <StatusIcon className={`h-4 w-4 ${getStatusColor(loanInfo.status)}`} />;
              })()}
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold capitalize ${getStatusColor(loanInfo.status)}`}>
                {getStatusText(loanInfo.status)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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

      {/* Detailed Info Section - Only show if loans exist */}
      {loanInfo.status !== 'no_loan' && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Payment Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{intl.formatMessage({ id: 'paymentProgress' })}</CardTitle>
              <CardDescription className="text-sm">{intl.formatMessage({ id: 'yourRepaymentJourney' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loanInfo.totalAmount > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{intl.formatMessage({ id: 'progress' })}</span>
                      <span className="font-medium">
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
                    <h4 className="text-sm font-medium mb-3">{intl.formatMessage({ id: 'loanBreakdown' })}</h4>
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

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{intl.formatMessage({ id: 'quickActions' })}</CardTitle>
              <CardDescription className="text-sm">{intl.formatMessage({ id: 'manageYourAccount' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto text-left"
                  onClick={() => navigate('/laureate/repayments')}
                >
                  <Calendar className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{intl.formatMessage({ id: 'viewPaymentSchedule' })}</div>
                    <div className="text-xs text-muted-foreground truncate">{intl.formatMessage({ id: 'seeUpcomingPayments' })}</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto text-left"
                  onClick={() => navigate('/laureate/loans')}
                >
                  <CreditCard className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{intl.formatMessage({ id: 'viewLoanHistory' })}</div>
                    <div className="text-xs text-muted-foreground truncate">{intl.formatMessage({ id: 'seeAllYourLoans' })}</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto text-left"
                  onClick={() => navigate('/laureate/profile')}
                >
                  <User className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{intl.formatMessage({ id: 'updateProfile' })}</div>
                    <div className="text-xs text-muted-foreground truncate">{intl.formatMessage({ id: 'managePersonalInformation' })}</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto text-left"
                  onClick={downloadPaymentSchedule}
                  disabled={downloading}
                >
                  <Download className={`h-4 w-4 mr-3 flex-shrink-0 ${downloading ? 'animate-spin' : ''}`} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">
                      {downloading ? intl.formatMessage({ id: 'downloading' }) : intl.formatMessage({ id: 'downloadSchedule' })}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{intl.formatMessage({ id: 'exportPaymentPlan' })}</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto text-left"
                  onClick={downloadPaymentHistory}
                  disabled={downloading}
                >
                  <FileText className={`h-4 w-4 mr-3 flex-shrink-0 ${downloading ? 'animate-spin' : ''}`} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">
                      {downloading ? intl.formatMessage({ id: 'downloading' }) : intl.formatMessage({ id: 'downloadHistory' })}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{intl.formatMessage({ id: 'exportAllPayments' })}</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overdue Alert - Mobile Optimized */}
      {loanInfo.status === 'overdue' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center text-base sm:text-lg">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span>{intl.formatMessage({ id: 'paymentOverdue' })}</span>
            </CardTitle>
            <CardDescription className="text-red-600 text-sm">
              {intl.formatMessage({ id: 'overdueAlertDescription' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto">
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