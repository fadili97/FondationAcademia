import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, AlertTriangle, DollarSign, Plus, FileText, TrendingUp, Activity } from 'lucide-react';
import { intl } from '@/i18n'; // Import intl from the i18n module
import api from '@/login/api';
import { formatCurrency } from '@/utils/currency';
function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRootPath = location.pathname === '/dashboard/admin';
  const [stats, setStats] = useState({
    totalLaureates: 0,
    activeLoans: 0,
    overduePayments: 0,
    totalAmount: 0,
    totalCollected: 0,
    pendingAmount: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    if (isRootPath) {
      fetchDashboardStats();
      fetchRecentActivity();
    }
  }, [isRootPath]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/api/admin/dashboard/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/api/admin/dashboard/recent_activity/');
      setRecentActivity(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create-loan':
        navigate('/dashboard/admin/loans/create');
        break;
      case 'add-laureate':
        navigate('/dashboard/admin/laureates/create');
        break;
      case 'generate-report':
        navigate('/dashboard/admin/reports');
        break;
      case 'view-overdue':
        navigate('/dashboard/admin/overdue');
        break;
      case 'manage-laureates':
        navigate('/dashboard/admin/laureates');
        break;
      case 'manage-loans':
        navigate('/dashboard/admin/loans');
        break;
      default:
        break;
    }
  };

  // If not on root path, render nested routes
  if (!isRootPath) {
    return <Outlet />;
  }

  const StatCard = ({ title, value, description, icon: Icon, trend, variant = "default" }) => (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {intl.formatMessage({ id: title })}
        </CardTitle>
        <Icon className={`h-4 w-4 ${variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variant === 'destructive' ? 'text-destructive' : ''}`}>
          {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {intl.formatMessage({ id: description })}
        </p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-xs text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {intl.formatMessage({ id: 'dashboardOverview' })}
        </h1>
        <p className="text-muted-foreground">
          {intl.formatMessage({ id: 'monitorFoundation' })}
        </p>
      </div>
      {/* Statistics Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="totalLaureates"
            value={stats.totalLaureates}
            description="activeScholarshipRecipients"
            icon={Users}
            trend="+2 this month" // Note: Trend is static and not translated; consider translating if dynamic
          />
          <StatCard
            title="activeLoans"
            value={stats.activeLoans}
            description="currentlyBeingRepaid"
            icon={CreditCard}
          />
          <StatCard
            title="overduePayments"
            value={stats.overduePayments}
            description="requireImmediateAttention"
            icon={AlertTriangle}
            variant="destructive"
          />
          <StatCard
            title="totalOutstanding"
            value={formatCurrency(stats.totalAmount)}
            description="outstandingLoanBalance"
            icon={DollarSign}
          />
        </div>
      )}
      {/* Secondary Stats & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{intl.formatMessage({ id: 'financialOverview' })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: 'currentFinancialStatus' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                {intl.formatMessage({ id: 'totalCollected' })}
              </span>
              <span className="text-sm font-bold text-green-600">
{formatCurrency(stats.totalCollected)}              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                {intl.formatMessage({ id: 'pendingPayments' })}
              </span>
              <span className="text-sm font-bold text-yellow-600">
{formatCurrency(stats.pendingAmount)}              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium text-muted-foreground">
                {intl.formatMessage({ id: 'collectionRate' })}
              </span>
              <span className="text-sm font-bold">
                {stats.totalAmount > 0
                  ? Math.round((stats.totalCollected / (stats.totalCollected + stats.pendingAmount)) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{intl.formatMessage({ id: 'recentActivity' })}</CardTitle>
              <CardDescription>{intl.formatMessage({ id: 'latestSystemActivities' })}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/admin/activity-logs')}>
              <Activity className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {intl.formatMessage({ id: 'noRecentActivity' })}
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {intl.formatMessage(
                        { id: 'by' },
                        { user_name: activity.user_name }
                      )}{' '}
                      • {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{intl.formatMessage({ id: 'quickActions' })}</CardTitle>
          <CardDescription>{intl.formatMessage({ id: 'commonAdministrativeTasks' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleQuickAction('create-loan')}
            >
              <Plus className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">{intl.formatMessage({ id: 'createNewLoan' })}</div>
                <div className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'addLoanForLaureate' })}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleQuickAction('add-laureate')}
            >
              <Users className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">{intl.formatMessage({ id: 'addNewLaureate' })}</div>
                <div className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'registerNewRecipient' })}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleQuickAction('generate-report')}
            >
              <FileText className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">{intl.formatMessage({ id: 'generateReport' })}</div>
                <div className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'createFinancialReports' })}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleQuickAction('view-overdue')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">{intl.formatMessage({ id: 'viewOverdue' })}</div>
                <div className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'manageLatePayments' })}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleQuickAction('manage-laureates')}
            >
              <Users className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">{intl.formatMessage({ id: 'manageLaureates' })}</div>
                <div className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'viewAllRecipients' })}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleQuickAction('manage-loans')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">{intl.formatMessage({ id: 'manageLoans' })}</div>
                <div className="text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'viewAllLoans' })}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Alert for Overdue Payments */}
      {stats.overduePayments > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {intl.formatMessage({ id: 'attentionRequired' })}
            </CardTitle>
            <CardDescription>
              {intl.formatMessage(
                { id: 'overduePaymentsAlert' },
                {
                  count: stats.overduePayments,
                  plural: stats.overduePayments !== 1 ? 's' : '',
                }
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => handleQuickAction('view-overdue')}
            >
              {intl.formatMessage({ id: 'viewOverduePayments' })}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminDashboard;
