import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';

function ReportsManagement() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReports();
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/api/admin/reports/');
      setReports(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  const generateFinancialReport = async () => {
    if (!dateFrom || !dateTo) {
      setMessage(intl.formatMessage({ id: 'selectDatesError' }));
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/api/admin/reports/generate_financial/', {
        date_from: dateFrom,
        date_to: dateTo
      });
      setMessage(intl.formatMessage({ id: 'financialReportSuccess' }));
      fetchReports(); // Refresh reports list
      console.log('Financial report generated:', response.data);
    } catch (error) {
      console.error('Error generating financial report:', error);
      setMessage(intl.formatMessage({ id: 'failedToGenerateFinancialReport' }));
    } finally {
      setLoading(false);
    }
  };

  const generateOverdueReport = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/api/admin/reports/generate_overdue/');
      setMessage(intl.formatMessage({ id: 'overdueReportSuccess' }));
      fetchReports(); // Refresh reports list
      console.log('Overdue report generated:', response.data);
    } catch (error) {
      console.error('Error generating overdue report:', error);
      setMessage(intl.formatMessage({ id: 'failedToGenerateOverdueReport' }));
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await api.get(`/api/admin/reports/${reportId}/download/`, {
        responseType: 'blob', // Important for handling binary data
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = response.headers['content-disposition']
        ?.match(/filename="(.+)"/)?.[1] || `report_${reportId}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setMessage(intl.formatMessage({ id: 'reportDownloadedSuccess' }));
    } catch (error) {
      console.error('Error downloading report:', error);
      setMessage(intl.formatMessage({ id: 'failedToDownloadReport' }));
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'financial': return DollarSign;
      case 'laureate': return Users;
      case 'loan': return BarChart3;
      case 'payment': return CheckCircle;
      case 'overdue': return AlertTriangle;
      default: return FileText;
    }
  };

  const getReportTypeBadge = (type) => {
    const variants = {
      financial: 'default',
      laureate: 'secondary',
      loan: 'outline',
      payment: 'default',
      overdue: 'destructive'
    };
    return variants[type] || 'secondary';
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-3xl font-bold">
          {intl.formatMessage({ id: 'reportsManagement' })}
        </h2>
        <p className="mt-2">
          {intl.formatMessage({ id: 'generateAndManageReports' })}
        </p>
      </div>
      {/* Success/Error Messages */}
      {message && (
        <Alert className={message.includes('successfully') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          {message.includes('successfully') ?
            <CheckCircle className="h-4 w-4 text-green-600" /> :
            <AlertTriangle className="h-4 w-4 text-red-600" />
          }
          <AlertDescription className={message.includes('successfully') ? 'text-green-700' : 'text-red-700'}>
            {message}
          </AlertDescription>
        </Alert>
      )}
      {/* Quick Report Generation */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              {intl.formatMessage({ id: 'financialReport' })}
            </CardTitle>
            <CardDescription>{intl.formatMessage({ id: 'generateFinancialReportDesc' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fin-date-from">{intl.formatMessage({ id: 'fromDate' })}</Label>
                <Input
                  id="fin-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-date-to">{intl.formatMessage({ id: 'toDate' })}</Label>
                <Input
                  id="fin-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={generateFinancialReport}
              className="w-full"
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? intl.formatMessage({ id: 'generating' }) : intl.formatMessage({ id: 'generateFinancialReport' })}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              {intl.formatMessage({ id: 'overdueReport' })}
            </CardTitle>
            <CardDescription>{intl.formatMessage({ id: 'generateOverdueReportDesc' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {intl.formatMessage({ id: 'overdueReportInfo' })}
            </div>
            <Button
              onClick={generateOverdueReport}
              className="w-full"
              disabled={loading}
              variant="destructive"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {loading ? intl.formatMessage({ id: 'generating' }) : intl.formatMessage({ id: 'generateOverdueReport' })}
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            {intl.formatMessage({ id: 'recentReports' })}
          </CardTitle>
          <CardDescription>{intl.formatMessage({ id: 'previouslyGeneratedReports' })}</CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="text-center py-4">
              {intl.formatMessage({ id: 'loadingReports' })}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{intl.formatMessage({ id: 'noReportsGenerated' })}</p>
              <p className="text-sm">{intl.formatMessage({ id: 'generateFirstReport' })}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.slice(0, 10).map((report) => {
                const IconComponent = getReportTypeIcon(report.report_type);
                return (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getReportTypeBadge(report.report_type)}>
                            {intl.formatMessage({ id: `reportType${report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}` })}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(report.created_at).toLocaleDateString(intl.locale)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {intl.formatMessage({ id: 'by' })} {report.generated_by_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {intl.formatMessage({ id: 'download' })}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {reports.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    {intl.formatMessage({ id: 'viewAllReports' })} ({reports.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Report Statistics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{intl.formatMessage({ id: 'totalReports' })}</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{intl.formatMessage({ id: 'reportsThisMonth' })}</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => {
                    const reportDate = new Date(r.created_at);
                    const now = new Date();
                    return reportDate.getMonth() === now.getMonth() &&
                      reportDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{intl.formatMessage({ id: 'financialReports' })}</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.report_type === 'financial').length}
                </p>
              </div>
              <DollarSign className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{intl.formatMessage({ id: 'overdueReports' })}</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.report_type === 'overdue').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportsManagement;