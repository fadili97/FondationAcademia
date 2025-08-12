import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CreditCard, User, Calendar, DollarSign, AlertCircle, Trash2, CheckCircle, Clock } from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';
import { formatCurrency } from '@/utils/currency';
function LoanEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [originalLoan, setOriginalLoan] = useState(null);
  const [formData, setFormData] = useState({
    laureate_id: '',
    laureate_name: '',
    amount: '',
    interest_rate: '',
    start_date: '',
    end_date: '',
    monthly_payment: '',
    status: '',
    notes: '',
    remaining_balance: '',
    total_paid: ''
  });
  const [hasPayments, setHasPayments] = useState(false);
  const [paymentCount, setPaymentCount] = useState(0);

  useEffect(() => {
    fetchLoan();
    checkExistingPayments();
  }, [id]);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/loans/loans/${id}/`);
      const loan = response.data;
      console.log('Loaded loan:', loan);
      setOriginalLoan(loan);
      setFormData({
        laureate_id: loan.laureate_info?.id || '',
        laureate_name: loan.laureate_info?.full_name || 'Unknown Laureate',
        amount: loan.amount || '',
        interest_rate: loan.interest_rate || '',
        start_date: loan.start_date || '',
        end_date: loan.end_date || '',
        monthly_payment: loan.monthly_payment || '',
        status: loan.status || '',
        notes: loan.notes || '',
        remaining_balance: loan.remaining_balance || '',
        total_paid: loan.total_paid || ''
      });
    } catch (error) {
      console.error('Error fetching loan:', error);
      setError(intl.formatMessage({ id: 'failedToLoadLoan' }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Prepare data for API - Only send editable fields
      const loanData = {
        status: formData.status,
        notes: formData.notes
      };
      console.log('Updating loan with data:', loanData);
      const response = await api.put(`/api/loans/loans/${id}/`, loanData);
      console.log('Loan updated:', response.data);
      setSuccess(intl.formatMessage({ id: 'loanUpdatedSuccess' }));
      setTimeout(() => {
        navigate('/dashboard/admin/loans');
      }, 1500);
    } catch (error) {
      console.error('Error updating loan:', error);
      console.error('Error response:', error.response?.data);
      let errorMessage = intl.formatMessage({ id: 'failedToUpdateLoan' });
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else {
          const errorMessages = [];
          Object.keys(errorData).forEach(field => {
            const fieldErrors = errorData[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(err => {
                errorMessages.push(`${field}: ${err}`);
              });
            } else {
              errorMessages.push(`${field}: ${fieldErrors}`);
            }
          });
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(intl.formatMessage({ id: 'confirmDeleteLoan' }))) {
      return;
    }
    try {
      setSaving(true);
      await api.delete(`/api/loans/loans/${id}/`);
      navigate('/dashboard/admin/loans');
    } catch (error) {
      console.error('Error deleting loan:', error);
      setError(intl.formatMessage({ id: 'failedToDeleteLoan' }));
      setSaving(false);
    }
  };

  const checkExistingPayments = async () => {
    try {
      const response = await api.get(`/api/payments/payments/?loan=${id}`);
      const payments = response.data?.results || response.data || [];
      setHasPayments(payments.length > 0);
      setPaymentCount(payments.length);
    } catch (error) {
      console.error('Error checking existing payments:', error);
      setHasPayments(false);
      setPaymentCount(0);
    }
  };

  const generatePaymentSchedule = async () => {
    try {
      setSaving(true);
      setError('');
      console.log('Generating payment schedule for loan ID:', id);
      const response = await api.post('/api/payments/payments/generate_schedule/', {
        loan_id: parseInt(id)
      });
      console.log('Payment schedule response:', response.data);
      setSuccess(intl.formatMessage(
        { id: 'paymentScheduleGeneratedSuccess' },
        { message: response.data.message || intl.formatMessage({ id: 'createdPaymentSchedule' }) }
      ));
      checkExistingPayments();
      setTimeout(() => {
        fetchLoan();
      }, 1000);
    } catch (error) {
      console.error('Error generating payment schedule:', error);
      console.error('Error response:', error.response?.data);
      let errorMessage = intl.formatMessage({ id: 'failedToGenerateSchedule' });
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/admin/loans');
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>{intl.formatMessage({ id: 'loadingLoanData' })}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={handleBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {intl.formatMessage({ id: 'editLoan' }, { id })}
          </h1>
          <p className="text-muted-foreground">
            {intl.formatMessage({ id: 'updateLoanStatusNotes' })}
          </p>
        </div>
        <Badge variant={getStatusColor(formData.status)}>
          {formData.status}
        </Badge>
      </div>
      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Loan Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                {intl.formatMessage({ id: 'loanInformation' })}
              </CardTitle>
              <CardDescription>{intl.formatMessage({ id: 'loanDetailsTerms' })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="laureate_name">{intl.formatMessage({ id: 'laureate' })}</Label>
                <Input
                  id="laureate_name"
                  value={formData.laureate_name}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'laureateCannotBeChanged' })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{intl.formatMessage({ id: 'loanAmount' })}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    disabled={true}
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'cannotChangeAfterCreation' })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_rate">{intl.formatMessage({ id: 'interestRate' })}</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  value={formData.interest_rate}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'cannotChangeAfterCreation' })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{intl.formatMessage({ id: 'status' })}</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{intl.formatMessage({ id: 'activeStatus' })}</SelectItem>
                    <SelectItem value="completed">{intl.formatMessage({ id: 'completedStatus' })}</SelectItem>
                    <SelectItem value="overdue">{intl.formatMessage({ id: 'overdueStatus' })}</SelectItem>
                    <SelectItem value="suspended">{intl.formatMessage({ id: 'suspendedStatus' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          {/* Payment Schedule Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {intl.formatMessage({ id: 'paymentSchedule' })}
              </CardTitle>
              <CardDescription>{intl.formatMessage({ id: 'loanDurationTerms' })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">{intl.formatMessage({ id: 'startDate' })}</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'cannotChangeAfterCreation' })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">{intl.formatMessage({ id: 'endDate' })}</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'cannotChangeAfterCreation' })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_payment">{intl.formatMessage({ id: 'monthlyPayment' })}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthly_payment"
                    type="number"
                    step="0.01"
                    value={formData.monthly_payment}
                    disabled={true}
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'cannotChangeAfterCreation' })}
                </p>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">{intl.formatMessage({ id: 'paymentProgress' })}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{intl.formatMessage({ id: 'totalAmount' })}:</span>
<span className="font-medium">{formatCurrency(formData.amount)}</span>                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{intl.formatMessage({ id: 'remainingBalance' })}:</span>
<span className="font-medium text-orange-600">{formatCurrency(formData.remaining_balance)}</span>                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{intl.formatMessage({ id: 'totalPaid' })}:</span>
<span className="font-medium text-green-600">{formatCurrency(formData.total_paid)}</span>                  </div>
                  {formData.amount && formData.total_paid && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{intl.formatMessage({ id: 'progress' })}</span>
                        <span>{Math.round((parseFloat(formData.total_paid) / parseFloat(formData.amount)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((parseFloat(formData.total_paid) / parseFloat(formData.amount)) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: 'additionalNotes' })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: 'loanNotes' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">{intl.formatMessage({ id: 'additionalNotes' })}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={intl.formatMessage({ id: 'notesPlaceholder' })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: 'loanActions' })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: 'additionalLoanActions' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (formData.laureate_id) {
                    navigate(`/dashbaord/admin/laureates/${formData.laureate_id}/edit`);
                  } else {
                    setError(intl.formatMessage({ id: 'laureateNotAvailable' }));
                  }
                }}
                disabled={!formData.laureate_id}
              >
                <User className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'viewLaureate' })}
              </Button>
              {!hasPayments ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePaymentSchedule}
                  disabled={saving}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {saving ? intl.formatMessage({ id: 'generating' }) : intl.formatMessage({ id: 'generatePaymentSchedule' })}
                </Button>
              ) : (
                <div className="flex items-center px-3 py-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {intl.formatMessage({ id: 'scheduleGenerated' }, { count: paymentCount })}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigate(`/dashboard/admin/payments?loan=${id}`);
                }}
                disabled={!hasPayments}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {hasPayments ? intl.formatMessage({ id: 'viewPayments' }, { count: paymentCount }) : intl.formatMessage({ id: 'paymentHistory' })}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={saving}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {intl.formatMessage({ id: 'deleteLoan' })}
          </Button>
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {intl.formatMessage({ id: 'saving' })}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {intl.formatMessage({ id: 'updateLoan' })}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoanEditForm;