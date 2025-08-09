import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Loader2, 
  Calendar,
  DollarSign,
  User,
  RefreshCw
} from 'lucide-react';
import { intl } from '@/i18n';
import api from '@/login/api';
import { formatCurrency } from '@/utils/currency';


function OverdueManagement() {
  const [overduePayments, setOverduePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOverduePayments();
  }, []);

  const fetchOverduePayments = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching overdue payments...');
      
      const response = await api.get('/api/payments/payments/overdue/');
      console.log('Overdue payments response:', response.data);
      
      // Handle both array and paginated response
      const data = response.data?.results || response.data || [];
      const paymentsArray = Array.isArray(data) ? data : [];
      
      setOverduePayments(paymentsArray);
      console.log('Set overdue payments:', paymentsArray);
      
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      setError(intl.formatMessage({ id: 'failedToLoadOverduePayments' }) || 'Failed to load overdue payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOverduePayments();
    setRefreshing(false);
  };

  const handleViewContact = async (payment) => {
    try {
      // Fetch laureate details to get contact info
      console.log('Fetching contact info for laureate ID:', payment.laureate_id);
      const response = await api.get(`/api/laureates/laureates/${payment.laureate_id}/`);
      const laureate = response.data;
      
      console.log('Laureate data received:', laureate);
      
      // Extract contact info from the response
      const phone = laureate.user?.phone || laureate.phone || 'Not provided';
      const email = laureate.user?.email || laureate.email || 'Not provided';
      const fullName = laureate.full_name || laureate.user?.first_name + ' ' + laureate.user?.last_name || payment.laureate_name;
      
      const contactInfo = `📞 Contact Information for ${fullName}

Phone: ${phone}
Email: ${email}

Payment Details:
• Payment ID: #${payment.id}
• Amount: ${payment.amount}
• Due Date: ${new Date(payment.due_date).toLocaleDateString()}
• Days Overdue: ${payment.days_overdue}`;
      
      alert(contactInfo);
    } catch (error) {
      console.error('Error fetching laureate details:', error);
      alert(`❌ Could not fetch contact details for ${payment.laureate_name}\n\nError: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleCallLaureate = async (payment) => {
    try {
      // Fetch laureate details to get phone number
      const response = await api.get(`/api/laureates/laureates/${payment.laureate_id}/`);
      const laureate = response.data;
      
      if (laureate.phone) {
        const message = `📞 Call ${laureate.full_name}\n\nPhone: ${laureate.phone}\nEmail: ${laureate.email || 'Not provided'}\n\nRegarding: Overdue payment #${payment.id}\nAmount: ${payment.amount}\nDue Date: ${new Date(payment.due_date).toLocaleDateString()}\nDays Overdue: ${payment.days_overdue}`;
        
        alert(message);
        
        // Optional: Open phone dialer on mobile
        if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
          window.open(`tel:${laureate.phone}`, '_self');
        }
      } else {
        alert(`❌ No phone number found for ${laureate.full_name}\n\nEmail: ${laureate.email || 'Not provided'}\n\nPlease update their contact information.`);
      }
    } catch (error) {
      console.error('Error fetching laureate details:', error);
      alert(`❌ Could not fetch contact details for ${payment.laureate_name}\n\nPlease try again or contact them through the laureate management page.`);
    }
  };

  const handleEmailLaureate = async (payment) => {
    try {
      // Fetch laureate details to get email
      const response = await api.get(`/api/laureates/laureates/${payment.laureate_id}/`);
      const laureate = response.data;
      
      if (laureate.email) {
        const subject = `Overdue Payment Reminder - Payment #${payment.id}`;
        const body = `Dear ${laureate.full_name},

This is a reminder about your overdue scholarship loan payment.

Payment Details:
- Payment ID: #${payment.id}
- Loan ID: #${payment.loan_id}
- Amount Due: ${payment.amount}
- Original Due Date: ${new Date(payment.due_date).toLocaleDateString()}
- Days Overdue: ${payment.days_overdue}

Please contact us as soon as possible to discuss payment arrangements.

Best regards,
Scholarship Administration Team`;

        const mailtoLink = `mailto:${laureate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Show confirmation with email details
        const confirmMessage = `📧 Send email to ${laureate.full_name}?\n\nTo: ${laureate.email}\nSubject: ${subject}\n\nThis will open your default email client.`;
        
        if (confirm(confirmMessage)) {
          window.open(mailtoLink, '_self');
        }
      } else {
        alert(`❌ No email address found for ${laureate.full_name}\n\nPhone: ${laureate.phone || 'Not provided'}\n\nPlease update their contact information.`);
      }
    } catch (error) {
      console.error('Error fetching laureate details:', error);
      alert(`❌ Could not fetch contact details for ${payment.laureate_name}\n\nPlease try again or contact them through the laureate management page.`);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {intl.formatMessage({ id: 'overdueManagement' }) || 'Overdue Management'}
            </h1>
            <p className="text-muted-foreground">
              {intl.formatMessage({ id: 'handleOverduePayments' }) || 'Handle overdue payments and contact laureates'}
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {intl.formatMessage({ id: 'refresh' }) || 'Refresh'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Card */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'overduePayments' }) || 'Overdue Payments'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">{overduePayments.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'totalOverdueAmount' }) || 'Total Amount'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
{formatCurrency(overduePayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'affectedLaureates' }) || 'Affected Laureates'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {new Set(overduePayments.map(p => p.laureate_name)).size}
                  </p>
                </div>
                <User className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overdue Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            {intl.formatMessage({ id: 'overduePayments' }) || 'Overdue Payments'} ({overduePayments.length})
          </CardTitle>
          <CardDescription>
            {intl.formatMessage({ id: 'paymentsRequireAttention' }) || 'Payments that require immediate attention'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">
                  {intl.formatMessage({ id: 'loadingOverduePayments' }) || 'Loading overdue payments...'}
                </span>
              </div>
            </div>
          ) : overduePayments.length === 0 ? (
            <div className="p-8 text-center text-green-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {intl.formatMessage({ id: 'noOverduePayments' }) || 'No Overdue Payments'}
              </p>
              <p className="text-sm text-muted-foreground">
                {intl.formatMessage({ id: 'allPaymentsUpToDate' }) || 'All payments are up to date!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-red-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'paymentId' }) || 'Payment ID'}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'laureate' }) || 'Laureate'}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'amount' }) || 'Amount'}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                      {intl.formatMessage({ id: 'dueDate' }) || 'Due Date'}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'daysOverdue' }) || 'Days Overdue'}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">
                      {intl.formatMessage({ id: 'status' }) || 'Status'}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'actions' }) || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overduePayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-red-50 transition-colors">
                      <td className="p-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          #{payment.id}
                        </code>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{payment.laureate_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {intl.formatMessage({ id: 'loanId' }) || 'Loan'}: #{payment.loan_id}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-red-600">
                         {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="p-4 text-sm hidden md:table-cell">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(payment.due_date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="destructive">
                          {payment.days_overdue} {intl.formatMessage({ id: 'days' }) || 'days'}
                        </Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <Badge variant="destructive">
                          {payment.status === 'overdue' ? 
                            (intl.formatMessage({ id: 'overdue' }) || 'Overdue') : 
                            (intl.formatMessage({ id: 'pending' }) || 'Pending')
                          }
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewContact(payment)}
                            title={intl.formatMessage({ id: 'viewContactInfo' }) || 'View Contact Info'}
                          >
                            <User className="h-4 w-4 mr-1" />
                            <span>
                              {intl.formatMessage({ id: 'contact' }) || 'Contact'}
                            </span>
                          </Button>
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


    </div>
  );
}

export default OverdueManagement;