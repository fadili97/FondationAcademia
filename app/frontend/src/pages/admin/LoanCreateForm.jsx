import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, CreditCard, User, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';
import { formatCurrency } from '@/utils/currency';

function LoanCreateForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [laureatesLoading, setLaureatesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [laureates, setLaureates] = useState([]);
  const [formData, setFormData] = useState({
    laureate_id: '',
    amount: '',
    interest_rate: '0.00',
    start_date: '',
    end_date: '',
    monthly_payment: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchActivelaureates();
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, start_date: today }));
  }, []);

  const fetchActivelaureates = async () => {
    try {
      const response = await api.get('/api/laureates/laureates/?active=true');
      console.log('Laureates response:', response.data);
      const data = response.data?.results || response.data || [];
      setLaureates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching laureates:', error);
      setError(intl.formatMessage({ id: 'failedToLoadLaureates' }));
    } finally {
      setLaureatesLoading(false);
    }
  };

  const calculateMonthlyPayment = (amount, interestRate, startDate, endDate) => {
    if (amount && startDate && endDate && interestRate !== '') {
      const principal = parseFloat(amount);
      const annualRate = parseFloat(interestRate) / 100;
      const monthlyRate = annualRate / 12;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (monthsDiff > 0) {
        let monthlyPayment;
        if (monthlyRate === 0) {
          monthlyPayment = principal / monthsDiff;
        } else {
          const factor = Math.pow(1 + monthlyRate, monthsDiff);
          monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
        }
        setFormData(prev => ({ ...prev, monthly_payment: monthlyPayment.toFixed(2) }));
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
    if (['amount', 'interest_rate', 'start_date', 'end_date'].includes(field)) {
      calculateMonthlyPayment(
        field === 'amount' ? value : formData.amount,
        field === 'interest_rate' ? value : formData.interest_rate,
        field === 'start_date' ? value : formData.start_date,
        field === 'end_date' ? value : formData.end_date
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!formData.laureate_id || !formData.amount || !formData.start_date || !formData.end_date) {
        throw new Error(intl.formatMessage({ id: 'requiredFieldsError' }));
      }
      if (parseFloat(formData.amount) <= 0) {
        throw new Error(intl.formatMessage({ id: 'invalidLoanAmountError' }));
      }
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        throw new Error(intl.formatMessage({ id: 'invalidDateRangeError' }));
      }
      if (parseFloat(formData.monthly_payment) <= 0) {
        throw new Error(intl.formatMessage({ id: 'invalidMonthlyPaymentError' }));
      }
      const loanData = {
        laureate_id: parseInt(formData.laureate_id),
        amount: parseFloat(formData.amount),
        interest_rate: parseFloat(formData.interest_rate),
        start_date: formData.start_date,
        end_date: formData.end_date,
        monthly_payment: parseFloat(formData.monthly_payment),
        status: formData.status,
        notes: formData.notes
      };
      console.log('Sending loan data:', loanData);
      const response = await api.post('/api/loans/loans/', loanData);
      console.log('Loan created:', response.data);
      setSuccess(intl.formatMessage({ id: 'loanCreatedSuccess' }));
      setTimeout(() => {
        navigate('/dashboard/admin/loans');
      }, 1500);
    } catch (error) {
      console.error('Error creating loan:', error);
      console.error('Error response:', error.response?.data);
      let errorMessage = intl.formatMessage({ id: 'failedToCreateLoan' });
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
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/admin/loans');
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={handleBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {intl.formatMessage({ id: 'createNewLoan' })}
          </h1>
          <p className="text-muted-foreground">
            {intl.formatMessage({ id: 'createScholarshipLoan' })}
          </p>
        </div>
      </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                {intl.formatMessage({ id: 'loanInformation' })}
              </CardTitle>
              <CardDescription>{intl.formatMessage({ id: 'basicLoanDetails' })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="laureate_id">{intl.formatMessage({ id: 'laureate' })} *</Label>
                <Select
                  value={formData.laureate_id}
                  onValueChange={(value) => {
                    console.log('Selected laureate ID:', value);
                    handleChange('laureate_id', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={laureatesLoading ? intl.formatMessage({ id: 'loadingLaureates' }) : intl.formatMessage({ id: 'selectLaureate' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {laureates.length === 0 && !laureatesLoading ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        {intl.formatMessage({ id: 'noActiveLaureates' })}
                      </div>
                    ) : (
                      laureates.map((laureate) => (
                        <SelectItem key={laureate.id} value={laureate.id.toString()}>
                          {laureate.full_name} ({laureate.student_id})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {laureatesLoading && (
                  <p className="text-xs text-muted-foreground">
                    {intl.formatMessage({ id: 'loadingLaureates' })}
                  </p>
                )}
                {!laureatesLoading && laureates.length === 0 && (
                  <p className="text-xs text-red-500">
                    {intl.formatMessage({ id: 'noActiveLaureatesError' })}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{intl.formatMessage({ id: 'loanAmount' })} *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_rate">{intl.formatMessage({ id: 'interestRate' })}</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.interest_rate}
                  onChange={(e) => handleChange('interest_rate', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{intl.formatMessage({ id: 'status' })}</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{intl.formatMessage({ id: 'activeStatus' })}</SelectItem>
                    <SelectItem value="pending">{intl.formatMessage({ id: 'pendingStatus' })}</SelectItem>
                    <SelectItem value="suspended">{intl.formatMessage({ id: 'suspendedStatus' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
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
                <Label htmlFor="start_date">{intl.formatMessage({ id: 'startDate' })} *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">{intl.formatMessage({ id: 'endDate' })} *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_payment">{intl.formatMessage({ id: 'monthlyPayment' })} *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthly_payment"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.monthly_payment}
                    onChange={(e) => handleChange('monthly_payment', e.target.value)}
                    className="pl-10"
                    placeholder={intl.formatMessage({ id: 'autoCalculatedNote' })}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'autoCalculatedNote' })}
                </p>
              </div>
              {formData.amount && formData.start_date && formData.end_date && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">{intl.formatMessage({ id: 'paymentSummary' })}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>{intl.formatMessage({ id: 'totalAmount' })}:</span>
<span className="font-medium">{formatCurrency(formData.amount)}</span>                    </div>
                    <div className="flex justify-between">
                      <span>{intl.formatMessage({ id: 'monthlyPayment' })}:</span>
<span className="font-medium">{formatCurrency(formData.monthly_payment)}</span>                    </div>
                    <div className="flex justify-between">
                      <span>{intl.formatMessage({ id: 'duration' })}:</span>
                      <span className="font-medium">
                        {formData.start_date && formData.end_date ?
                          Math.round((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24 * 30.44))
                          : 0} {intl.formatMessage({ id: 'months' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: 'additionalNotes' })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: 'optionalLoanNotes' })}</CardDescription>
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
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
          <Button type="submit" disabled={loading || !formData.laureate_id || !formData.amount || !formData.monthly_payment}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {intl.formatMessage({ id: 'creating' })}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'createLoan' })}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default LoanCreateForm;