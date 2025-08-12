import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Save, Edit, GraduationCap } from 'lucide-react';
import { intl } from '@/i18n';
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
    return (
      <div className="p-3 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <div className="h-6 bg-muted rounded w-32"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-10 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
      {/* Header Section - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-start">
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {intl.formatMessage({ id: 'myProfile' })}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {intl.formatMessage({ id: 'managePersonalInformation' })}
          </p>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
          className="w-full sm:w-auto min-w-[120px]"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {saving ? intl.formatMessage({ id: 'saving' }) : intl.formatMessage({ id: 'saveChanges' })}
              </span>
              <span className="sm:hidden">
                {saving ? intl.formatMessage({ id: 'saving' }) : 'Save'}
              </span>
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{intl.formatMessage({ id: 'editProfile' })}</span>
              <span className="sm:hidden">Edit</span>
            </>
          )}
        </Button>
      </div>

      {/* Profile Cards Grid - Mobile Responsive */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Personal Information Card */}
        <Card className="order-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span>{intl.formatMessage({ id: 'personalInformation' })}</span>
            </CardTitle>
            <CardDescription className="text-sm">
              {intl.formatMessage({ id: 'basicPersonalDetails' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {/* Name Fields - Mobile Stacked */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">
                  {intl.formatMessage({ id: 'firstName' })}
                </Label>
                <Input
                  id="first_name"
                  value={profile.user.first_name || ''}
                  onChange={(e) => handleChange('user.first_name', e.target.value)}
                  disabled={!isEditing}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">
                  {intl.formatMessage({ id: 'lastName' })}
                </Label>
                <Input
                  id="last_name"
                  value={profile.user.last_name || ''}
                  onChange={(e) => handleChange('user.last_name', e.target.value)}
                  disabled={!isEditing}
                  className="h-10"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {intl.formatMessage({ id: 'email' })}
              </Label>
              <Input
                id="email"
                value={profile.user.email || ''}
                disabled={true}
                className="bg-muted h-10"
              />
              <p className="text-xs text-muted-foreground">
                {intl.formatMessage({ id: 'emailCannotBeChanged' })}
              </p>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                {intl.formatMessage({ id: 'phone' })}
              </Label>
              <Input
                id="phone"
                value={profile.user.phone || ''}
                onChange={(e) => handleChange('user.phone', e.target.value)}
                disabled={!isEditing}
                className="h-10"
                placeholder="Optional"
              />
            </div>

            {/* Birth Date Field */}
            <div className="space-y-2">
              <Label htmlFor="birth_date" className="text-sm font-medium">
                {intl.formatMessage({ id: 'birthDate' })}
              </Label>
              <Input
                id="birth_date"
                type="date"
                value={profile.user.birth_date || ''}
                onChange={(e) => handleChange('user.birth_date', e.target.value)}
                disabled={!isEditing}
                className="h-10"
              />
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                {intl.formatMessage({ id: 'address' })}
              </Label>
              <Textarea
                id="address"
                value={profile.user.address || ''}
                onChange={(e) => handleChange('user.address', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="resize-none"
                placeholder="Optional"
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information Card */}
        <Card className="order-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span>{intl.formatMessage({ id: 'academicInformation' })}</span>
            </CardTitle>
            <CardDescription className="text-sm">
              {intl.formatMessage({ id: 'academicDetailsAndEmergencyContact' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {/* Student ID Field */}
            <div className="space-y-2">
              <Label htmlFor="student_id" className="text-sm font-medium">
                {intl.formatMessage({ id: 'studentId' })}
              </Label>
              <Input
                id="student_id"
                value={profile.student_id || ''}
                disabled={true}
                className="bg-muted h-10 font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {intl.formatMessage({ id: 'studentIdCannotBeChanged' })}
              </p>
            </div>

            {/* Institution Field */}
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-sm font-medium">
                {intl.formatMessage({ id: 'institution' })}
              </Label>
              <Input
                id="institution"
                value={profile.institution || ''}
                onChange={(e) => handleChange('institution', e.target.value)}
                disabled={!isEditing}
                className="h-10"
              />
            </div>

            {/* Field of Study */}
            <div className="space-y-2">
              <Label htmlFor="field_of_study" className="text-sm font-medium">
                {intl.formatMessage({ id: 'fieldOfStudy' })}
              </Label>
              <Input
                id="field_of_study"
                value={profile.field_of_study || ''}
                onChange={(e) => handleChange('field_of_study', e.target.value)}
                disabled={!isEditing}
                className="h-10"
              />
            </div>

            {/* Graduation Year & GPA - Mobile Stacked */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="graduation_year" className="text-sm font-medium">
                  {intl.formatMessage({ id: 'graduationYear' })}
                </Label>
                <Input
                  id="graduation_year"
                  type="number"
                  value={profile.graduation_year || ''}
                  onChange={(e) => handleChange('graduation_year', e.target.value)}
                  disabled={!isEditing}
                  className="h-10"
                  min="2000"
                  max="2030"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa" className="text-sm font-medium">
                  {intl.formatMessage({ id: 'gpa' })}
                </Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.00"
                  value={profile.gpa || ''}
                  onChange={(e) => handleChange('gpa', e.target.value)}
                  disabled={!isEditing}
                  className="h-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Emergency Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name" className="text-sm font-medium">
                {intl.formatMessage({ id: 'emergencyContactName' })}
              </Label>
              <Input
                id="emergency_contact_name"
                value={profile.emergency_contact_name || ''}
                onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                disabled={!isEditing}
                className="h-10"
                placeholder="Optional"
              />
            </div>

            {/* Emergency Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone" className="text-sm font-medium">
                {intl.formatMessage({ id: 'emergencyContactPhone' })}
              </Label>
              <Input
                id="emergency_contact_phone"
                value={profile.emergency_contact_phone || ''}
                onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                disabled={!isEditing}
                className="h-10"
                placeholder="Optional"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Edit/Save Button - Fixed Bottom on Mobile */}
      {isEditing && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border shadow-lg">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Add padding bottom on mobile when editing to account for fixed button */}
      {isEditing && <div className="sm:hidden h-20"></div>}
    </div>
  );
}

export default LaureateProfile;