import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    phone: '',
    address: '',
    birth_date: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const response = await api.post('/api/accounts/auth/register/', formData);
      // Success - redirect to login with success message
      navigate('/login', {
        state: {
          message: intl.formatMessage({ id: 'accountCreatedSuccess' }),
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: intl.formatMessage({ id: 'registrationFailed' }) });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{intl.formatMessage({ id: 'joinAsLaureate' })}</CardTitle>
          <CardDescription>{intl.formatMessage({ id: 'createLaureateAccount' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
            <p className="text-sm text-primary" dangerouslySetInnerHTML={{ __html: intl.formatMessage({ id: 'laureateRegistrationNote' }) }} />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{intl.formatMessage({ id: 'firstName' })} *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{intl.formatMessage({ id: 'lastName' })} *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{intl.formatMessage({ id: 'username' })} *</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={intl.formatMessage({ id: 'usernamePlaceholder' })}
                required
              />
              {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{intl.formatMessage({ id: 'emailAddress' })} *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={intl.formatMessage({ id: 'emailPlaceholder' })}
                required
              />
              <p className="text-xs text-muted-foreground">{intl.formatMessage({ id: 'emailLoginNote' })}</p>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            {/* Optional Fields */}
            <div className="space-y-2">
              <Label htmlFor="phone">{intl.formatMessage({ id: 'phoneNumber' })}</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={intl.formatMessage({ id: 'phonePlaceholder' })}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">{intl.formatMessage({ id: 'birthDate' })}</Label>
              <Input
                id="birth_date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
              />
              {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{intl.formatMessage({ id: 'address' })}</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={intl.formatMessage({ id: 'addressPlaceholder' })}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>
            {/* Password Fields */}
            <div className="space-y-2">
              <Label htmlFor="password">{intl.formatMessage({ id: 'password' })} *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">{intl.formatMessage({ id: 'confirmPassword' })} *</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
              {errors.confirm_password && <p className="text-sm text-destructive">{errors.confirm_password}</p>}
            </div>
            {/* Error Messages */}
            {errors.general && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}
            {errors.non_field_errors && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {errors.non_field_errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? intl.formatMessage({ id: 'creatingAccount' }) : intl.formatMessage({ id: 'createLaureateAccountButton' })}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {intl.formatMessage({ id: 'alreadyHaveAccount' })}{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                {intl.formatMessage({ id: 'signInHere' })}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;