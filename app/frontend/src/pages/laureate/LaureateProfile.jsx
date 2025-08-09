import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Save, Edit } from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';

function LaureateProfile() {
  const [profile, setProfile] = useState({
    user: {},
    student_id: '',
    institution: '',
    field_of_study: '',
    graduation_year: '',
    gpa: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/laureates/laureates/my_profile/');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/api/laureates/laureates/my_profile/', {
        ...profile,
        user_data: {
          first_name: profile.user.first_name,
          last_name: profile.user.last_name,
          phone: profile.user.phone,
          address: profile.user.address,
          birth_date: profile.user.birth_date
        }
      });
      setProfile(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith('user.')) {
      const userField = field.replace('user.', '');
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [userField]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return <div className="p-6">{intl.formatMessage({ id: 'loadingProfile' })}</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {intl.formatMessage({ id: 'myProfile' })}
          </h2>
          <p className="text-gray-600 mt-2">
            {intl.formatMessage({ id: 'managePersonalInformation' })}
          </p>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              {saving ? intl.formatMessage({ id: 'saving' }) : intl.formatMessage({ id: 'saveChanges' })}
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              {intl.formatMessage({ id: 'editProfile' })}
            </>
          )}
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
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
                <Label htmlFor="first_name">{intl.formatMessage({ id: 'firstName' })}</Label>
                <Input
                  id="first_name"
                  value={profile.user.first_name || ''}
                  onChange={(e) => handleChange('user.first_name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{intl.formatMessage({ id: 'lastName' })}</Label>
                <Input
                  id="last_name"
                  value={profile.user.last_name || ''}
                  onChange={(e) => handleChange('user.last_name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{intl.formatMessage({ id: 'email' })}</Label>
              <Input
                id="email"
                value={profile.user.email || ''}
                disabled={true}
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">{intl.formatMessage({ id: 'emailCannotBeChanged' })}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{intl.formatMessage({ id: 'phone' })}</Label>
              <Input
                id="phone"
                value={profile.user.phone || ''}
                onChange={(e) => handleChange('user.phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">{intl.formatMessage({ id: 'birthDate' })}</Label>
              <Input
                id="birth_date"
                type="date"
                value={profile.user.birth_date || ''}
                onChange={(e) => handleChange('user.birth_date', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{intl.formatMessage({ id: 'address' })}</Label>
              <Textarea
                id="address"
                value={profile.user.address || ''}
                onChange={(e) => handleChange('user.address', e.target.value)}
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: 'academicInformation' })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: 'academicDetailsAndEmergencyContact' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student_id">{intl.formatMessage({ id: 'studentId' })}</Label>
              <Input
                id="student_id"
                value={profile.student_id || ''}
                disabled={true}
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">{intl.formatMessage({ id: 'studentIdCannotBeChanged' })}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">{intl.formatMessage({ id: 'institution' })}</Label>
              <Input
                id="institution"
                value={profile.institution || ''}
                onChange={(e) => handleChange('institution', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field_of_study">{intl.formatMessage({ id: 'fieldOfStudy' })}</Label>
              <Input
                id="field_of_study"
                value={profile.field_of_study || ''}
                onChange={(e) => handleChange('field_of_study', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduation_year">{intl.formatMessage({ id: 'graduationYear' })}</Label>
                <Input
                  id="graduation_year"
                  type="number"
                  value={profile.graduation_year || ''}
                  onChange={(e) => handleChange('graduation_year', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">{intl.formatMessage({ id: 'gpa' })}</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  max="4.00"
                  value={profile.gpa || ''}
                  onChange={(e) => handleChange('gpa', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">{intl.formatMessage({ id: 'emergencyContactName' })}</Label>
              <Input
                id="emergency_contact_name"
                value={profile.emergency_contact_name || ''}
                onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">{intl.formatMessage({ id: 'emergencyContactPhone' })}</Label>
              <Input
                id="emergency_contact_phone"
                value={profile.emergency_contact_phone || ''}
                onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LaureateProfile;