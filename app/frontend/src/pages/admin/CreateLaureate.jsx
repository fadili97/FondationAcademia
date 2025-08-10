import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Upload, Download, Plus, Users } from 'lucide-react';
import api from '@/login/api';

function CreateLaureate() {
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    student_id: '',
    institution: '',
    field_of_study: '',
    graduation_year: 2025,
    password: 'TempPassword123!'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate username from name
    if (field === 'first_name' || field === 'last_name') {
      if (!formData.username || formData.username === `${formData.first_name}.${formData.last_name}`.toLowerCase()) {
        const newUsername = `${field === 'first_name' ? value : formData.first_name}.${field === 'last_name' ? value : formData.last_name}`.toLowerCase();
        setFormData(prev => ({ ...prev, [field]: value, username: newUsername }));
      }
    }
    
    // Auto-generate student ID
    if ((field === 'first_name' || field === 'last_name') && !formData.student_id) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({ ...prev, student_id: `LAU${timestamp}${random}` }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      await api.post('/api/laureates/laureates/create_single/', formData);
      setSuccess('Laureate created successfully!');
      setFormData({
        username: '', email: '', first_name: '', last_name: '',
        student_id: '', institution: '', field_of_study: '',
        graduation_year: 2025, password: 'TempPassword123!'
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create laureate');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('csv_file', csvFile);
    
    try {
      const response = await api.post('/api/laureates/laureates/bulk_create/', formData);
      setSuccess(`Uploaded! Created: ${response.data.created_count}, Errors: ${response.data.error_count}`);
      setCsvFile(null);
      fileRef.current.value = '';
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'username,email,first_name,last_name,student_id,institution,field_of_study,graduation_year\njohn.doe,john@example.com,John,Doe,LAU001,University,Computer Science,2025';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Create Laureates</h1>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Single Laureate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Single Laureate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label>Username *</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label>Student ID *</Label>
                <Input
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  placeholder="LAU001"
                  required
                />
              </div>
              
              <div>
                <Label>Institution *</Label>
                <Input
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label>Field of Study *</Label>
                <Input
                  value={formData.field_of_study}
                  onChange={(e) => handleChange('field_of_study', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label>Graduation Year</Label>
                <Input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) => handleChange('graduation_year', e.target.value)}
                />
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? 'Creating...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Laureate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CSV Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Bulk Upload (CSV)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>CSV File</Label>
              <Input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
              />
              <p className="text-xs text-gray-500 mt-1">
                Required: username, email, first_name, last_name, student_id, institution, field_of_study
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={downloadTemplate} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button onClick={handleCSVUpload} disabled={!csvFile || loading} className="flex-1">
                {loading ? 'Uploading...' : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </>
                )}
              </Button>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <strong>CSV Format:</strong>
              <br />• username (unique)
              <br />• email (unique)
              <br />• first_name, last_name
              <br />• student_id (unique)
              <br />• institution, field_of_study
              <br />• graduation_year (optional)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateLaureate;