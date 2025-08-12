import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { intl } from '@/i18n';
import api from '@/login/api';
import { formatCurrency } from '@/utils/currency';

function LoanHistory() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/api/loans/loans/my_loans/');
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'overdue': return 'destructive';
      case 'suspended': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return TrendingUp;
      case 'completed': return Calendar;
      case 'overdue': return Clock;
      default: return CreditCard;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
        {/* Loading Header */}
        <div className="space-y-2">
          <div className="h-8 sm:h-10 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
        </div>
        
        {/* Loading Cards */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
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
          {intl.formatMessage({ id: 'loanHistory' })}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {intl.formatMessage({ id: 'viewAllScholarshipLoans' })}
        </p>
      </div>

      {/* No Loans State */}
      {loans.length === 0 ? (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <CreditCard className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
              {intl.formatMessage({ id: 'noLoansFound' })}
            </h3>
            <p className="text-sm text-muted-foreground">
              Your loan history will appear here once loans are created.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Loans List - Mobile Responsive */
        <div className="space-y-4 sm:space-y-6">
          {loans.map((loan) => {
            const StatusIcon = getStatusIcon(loan.status);
            return (
              <Card key={loan.id} className="overflow-hidden">
                {/* Card Header - Mobile Optimized */}
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {intl.formatMessage({ id: 'loan' }, { id: loan.id })}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {intl.formatMessage(
                          { id: 'createdOn' },
                          { date: new Date(loan.created_at).toLocaleDateString(intl.locale) }
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(loan.status)} className="self-start sm:self-center">
                      {intl.formatMessage({ id: `${loan.status}Status` })}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Main Financial Info - Mobile Stack */}
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-4 sm:mb-6">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                          {intl.formatMessage({ id: 'totalAmount' })}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                          {formatCurrency(loan.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                          {intl.formatMessage({ id: 'remainingBalance' })}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 truncate">
                          {formatCurrency(loan.remaining_balance)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                          {intl.formatMessage({ id: 'monthlyPayment' })}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 truncate">
                          {formatCurrency(loan.monthly_payment)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Loan Details - Mobile Responsive Grid */}
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 text-sm border-t pt-4">
                    <div className="flex justify-between sm:block">
                      <span className="font-medium text-muted-foreground">
                        {intl.formatMessage({ id: 'startDate' })}:
                      </span>
                      <span className="text-foreground sm:block">
                        {new Date(loan.start_date).toLocaleDateString(intl.locale)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between sm:block">
                      <span className="font-medium text-muted-foreground">
                        {intl.formatMessage({ id: 'endDate' })}:
                      </span>
                      <span className="text-foreground sm:block">
                        {new Date(loan.end_date).toLocaleDateString(intl.locale)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between sm:block">
                      <span className="font-medium text-muted-foreground">
                        {intl.formatMessage({ id: 'interestRate' })}:
                      </span>
                      <span className="text-foreground sm:block">
                        {loan.interest_rate}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between sm:block">
                      <span className="font-medium text-muted-foreground">
                        {intl.formatMessage({ id: 'totalPaid' })}:
                      </span>
                      <span className="text-foreground font-semibold sm:block">
                        {formatCurrency(loan.total_paid)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar - Mobile Optimized */}
                  {loan.amount > 0 && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Payment Progress
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {Math.round((loan.total_paid / loan.amount) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round((loan.total_paid / loan.amount) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Paid: {formatCurrency(loan.total_paid)}</span>
                        <span>Remaining: {formatCurrency(loan.remaining_balance)}</span>
                      </div>
                    </div>
                  )}

                  {/* Notes Section - Mobile Optimized */}
                  {loan.notes && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-600 dark:border-blue-400">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        {intl.formatMessage({ id: 'notes' })}:
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {loan.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LoanHistory;