import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  GraduationCap,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';

function ApplicationsReview() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      setError('');
      // Get all inactive laureates (these are pending applications)
      const response = await api.get('/api/laureates/laureates/?active=false');
      const data = response.data?.results || response.data || [];
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(intl.formatMessage({ id: 'failedToLoadApplications' }));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    try {
      setActionLoading(applicationId);
      await api.post(`/api/laureates/laureates/${applicationId}/toggle_status/`);
      setSuccess(intl.formatMessage({ id: 'applicationApprovedSuccess' }));
      fetchPendingApplications(); // Refresh the list
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error approving application:', error);
      setError(intl.formatMessage({ id: 'failedToApproveApplication' }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId) => {
    try {
      setActionLoading(applicationId);
      // Get the laureate to find the user
      const laureateResponse = await api.get(`/api/laureates/laureates/${applicationId}/`);
      const userId = laureateResponse.data.user.id;
      // Deactivate the user account
      await api.post(`/api/accounts/users/${userId}/toggle_status/`);
      setSuccess(intl.formatMessage({ id: 'applicationRejectedSuccess' }));
      fetchPendingApplications(); // Refresh the list
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error rejecting application:', error);
      setError(intl.formatMessage({ id: 'failedToRejectApplication' }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(intl.locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {intl.formatMessage({ id: 'reviewApplications' })}
        </h1>
        <p className="text-muted-foreground">
          {intl.formatMessage({ id: 'reviewPendingApplications' })}
        </p>
      </div>
      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
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
      {/* Applications Count */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {intl.formatMessage({ id: 'pendingApplications' })}
              </p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {intl.formatMessage({ id: 'pendingApplications' })} ({applications.length})
          </CardTitle>
          <CardDescription>
            {intl.formatMessage({ id: 'newStudentRegistrations' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">
                  {intl.formatMessage({ id: 'loadingApplications' })}
                </span>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {intl.formatMessage({ id: 'noPendingApplications' })}
              </p>
              <p className="text-sm">
                {intl.formatMessage({ id: 'allRegistrationsReviewed' })}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'studentId' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'name' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'email' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">
                      {intl.formatMessage({ id: 'institution' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">
                      {intl.formatMessage({ id: 'applied' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'status' })}
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      {intl.formatMessage({ id: 'actions' })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          {application.student_id}
                        </code>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{application.full_name}</div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{application.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm hidden lg:table-cell">
                        <div className="flex items-center space-x-1">
                          <GraduationCap className="h-3 w-3 text-muted-foreground" />
                          <span>{application.institution || intl.formatMessage({ id: 'notSpecified' })}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm hidden lg:table-cell">
                        {formatDate(application.created_at)}
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {intl.formatMessage({ id: 'status' })}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(application)}
                            className="h-8 w-8 p-0"
                            title={intl.formatMessage({ id: 'viewDetails' })}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">{intl.formatMessage({ id: 'viewDetails' })}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(application.id)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={actionLoading === application.id}
                            title={intl.formatMessage({ id: 'approve' })}
                          >
                            {actionLoading === application.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            <span className="sr-only">{intl.formatMessage({ id: 'approve' })}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(application.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={actionLoading === application.id}
                            title={intl.formatMessage({ id: 'reject' })}
                          >
                            {actionLoading === application.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span className="sr-only">{intl.formatMessage({ id: 'reject' })}</span>
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
      {/* Application Details Modal */}
      {selectedApplication && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {intl.formatMessage(
                  { id: 'applicationDetails' },
                  { fullName: selectedApplication.full_name }
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApplication(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'studentId' })}
                  </p>
                  <p className="font-mono">{selectedApplication.student_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'fullName' })}
                  </p>
                  <p>{selectedApplication.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'email' })}
                  </p>
                  <p>{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'institution' })}
                  </p>
                  <p>{selectedApplication.institution || intl.formatMessage({ id: 'notSpecified' })}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'fieldOfStudy' })}
                  </p>
                  <p>{selectedApplication.field_of_study || intl.formatMessage({ id: 'notSpecified' })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'graduationYear' })}
                  </p>
                  <p>{selectedApplication.graduation_year || intl.formatMessage({ id: 'notSpecified' })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'gpa' })}
                  </p>
                  <p>{selectedApplication.gpa || intl.formatMessage({ id: 'notProvided' })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'appliedOn' })}
                  </p>
                  <p>{formatDate(selectedApplication.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button
                onClick={() => handleApprove(selectedApplication.id)}
                disabled={actionLoading === selectedApplication.id}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'approveApplication' })}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedApplication.id)}
                disabled={actionLoading === selectedApplication.id}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'rejectApplication' })}
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'contactApplicant' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ApplicationsReview;