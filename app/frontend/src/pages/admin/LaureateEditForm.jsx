import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, User, GraduationCap, AlertCircle } from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';

function LaureateEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    // User fields
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    // Laureate fields
    student_id: '',
    institution: '',
    field_of_study: '',
    graduation_year: '',
    gpa: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    is_active: true
  });

  useEffect(() => {
    fetchLaureate();
  }, [id]);

  const fetchLaureate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/laureates/laureates/${id}/`);
      const laureate = response.data;
      setFormData({
        // User fields
        first_name: laureate.user?.first_name || '',
        last_name: laureate.user?.last_name || '',
        email: laureate.user?.email || '',
        phone: laureate.user?.phone || '',
        address: laureate.user?.address || '',
        birth_date: laureate.user?.birth_date || '',
        // Laureate fields
        student_id: laureate.student_id || '',
        institution: laureate.institution || '',
        field_of_study: laureate.field_of_study || '',
        graduation_year: laureate.graduation_year || '',
        gpa: laureate.gpa || '',
        emergency_contact_name: laureate.emergency_contact_name || '',
        emergency_contact_phone: laureate.emergency_contact_phone || '',
        is_active: laureate.is_active
      });
    } catch (error) {
      console.error('Error fetching laureate:', error);
      setError(intl.formatMessage({ id: 'failedToLoadLaureate' }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Prepare data for API
      const updateData = {
        // Laureate fields
        institution: formData.institution,
        field_of_study: formData.field_of_study,
        graduation_year: parseInt(formData.graduation_year) || null,
        gpa: parseFloat(formData.gpa) || null,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        is_active: formData.is_active,
        // User data nested object
        user_data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
          birth_date: formData.birth_date || null
        }
      };
      await api.put(`/api/laureates/laureates/${id}/`, updateData);
      setSuccess(intl.formatMessage({ id: 'laureateUpdatedSuccess' }));
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/dashboard/admin/laureates');
      }, 1500);
    } catch (error) {
      console.error('Error updating laureate:', error);
      setError(intl.formatMessage({ id: 'failedToUpdateLaureate' }));
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/admin/laureates');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>{intl.formatMessage({ id: 'loadingLaureateData' })}</span>
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {intl.formatMessage({ id: 'editLaureate' })}
          </h1>
          <p className="text-muted-foreground">
            {intl.formatMessage({ id: 'updateLaureateProfile' })}
          </p>
        </div>
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
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {intl.formatMessage({ id: 'personalInformation' })}
              </CardTitle>
              <CardDescription>{intl.formatMessage({ id: 'basicPersonalDetails' })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{intl.formatMessage({ id: 'firstName' })} *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{intl.formatMessage({ id: 'lastName' })} *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{intl.formatMessage({ id: 'email' })}</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'emailCannotBeChanged' })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{intl.formatMessage({ id: 'phone' })}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">{intl.formatMessage({ id: 'birthDate' })}</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{intl.formatMessage({ id: 'address' })}</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          {/* Academic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                {intl.formatMessage({ id: 'academicInformation' })}
              </CardTitle>
              <CardDescription>{intl.formatMessage({ id: 'academicDetailsAndEmergencyContact' })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">{intl.formatMessage({ id: 'studentId' })}</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'studentIdCannotBeChanged' })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">{intl.formatMessage({ id: 'institution' })} *</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field_of_study">{intl.formatMessage({ id: 'fieldOfStudy' })} *</Label>
                <Input
                  id="field_of_study"
                  value={formData.field_of_study}
                  onChange={(e) => handleChange('field_of_study', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">{intl.formatMessage({ id: 'graduationYear' })}</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    min="2020"
                    max="2030"
                    value={formData.graduation_year}
                    onChange={(e) => handleChange('graduation_year', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">{intl.formatMessage({ id: 'gpa' })}</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.00"
                    value={formData.gpa}
                    onChange={(e) => handleChange('gpa', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">{intl.formatMessage({ id: 'emergencyContactName' })}</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">{intl.formatMessage({ id: 'emergencyContactPhone' })}</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">{intl.formatMessage({ id: 'status' })}</Label>
                <select
                  id="is_active"
                  className="w-full p-2 border rounded-md"
                  value={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.value === 'true')}
                >
                  <option value={true}>{intl.formatMessage({ id: 'active' })}</option>
                  <option value={false}>{intl.formatMessage({ id: 'inactive' })}</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Save Button */}
        <div className="flex justify-end space-x-4">
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
                {intl.formatMessage({ id: 'saveChanges' })}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default LaureateEditForm;