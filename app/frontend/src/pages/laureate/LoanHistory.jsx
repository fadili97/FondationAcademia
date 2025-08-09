import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, DollarSign } from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
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

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {intl.formatMessage({ id: 'loanHistory' })}
        </h2>
        <p className="text-gray-600 mt-2">
          {intl.formatMessage({ id: 'viewAllScholarshipLoans' })}
        </p>
      </div>
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">{intl.formatMessage({ id: 'loadingLoans' })}</div>
          </CardContent>
        </Card>
      ) : loans.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">{intl.formatMessage({ id: 'noLoansFound' })}</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {loans.map((loan) => (
            <Card key={loan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      {intl.formatMessage({ id: 'loan' }, { id: loan.id })}
                    </CardTitle>
                    <CardDescription>
                      {intl.formatMessage(
                        { id: 'createdOn' },
                        { date: new Date(loan.created_at).toLocaleDateString(intl.locale) }
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(loan.status)}>
                    {intl.formatMessage({ id: `${loan.status}Status` })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{intl.formatMessage({ id: 'totalAmount' })}</p>
<p className="text-lg font-bold">{formatCurrency(loan.amount)}</p>                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{intl.formatMessage({ id: 'remainingBalance' })}</p>
<p className="text-lg font-bold">{formatCurrency(loan.remaining_balance)}</p>                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{intl.formatMessage({ id: 'monthlyPayment' })}</p>
<p className="text-lg font-bold">{formatCurrency(loan.monthly_payment)}</p>                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2 text-sm">
                  <div>
                    <span className="font-medium">{intl.formatMessage({ id: 'startDate' })}:</span>{' '}
                    {new Date(loan.start_date).toLocaleDateString(intl.locale)}
                  </div>
                  <div>
                    <span className="font-medium">{intl.formatMessage({ id: 'endDate' })}:</span>{' '}
                    {new Date(loan.end_date).toLocaleDateString(intl.locale)}
                  </div>
                  <div>
                    <span className="font-medium">{intl.formatMessage({ id: 'interestRate' })}:</span>{' '}
                    {loan.interest_rate}%
                  </div>
                  <div>
                    <span className="font-medium">{intl.formatMessage({ id: 'totalPaid' })}:</span>{' '}
{formatCurrency(loan.total_paid)}                  </div>
                </div>
                {loan.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium mb-1">{intl.formatMessage({ id: 'notes' })}:</p>
                    <p className="text-sm text-gray-600">{loan.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default LoanHistory;