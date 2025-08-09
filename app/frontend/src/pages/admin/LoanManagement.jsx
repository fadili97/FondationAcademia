import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Plus,
  MoreVertical,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { intl } from '@/i18n';
import api from '@/login/api';
import { formatCurrency } from '@/utils/currency';
function LoanManagement() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchLoans();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      const response = await api.get(`/api/loans/loans/?${params}`);
      console.log('Loans data:', response.data);
      
      // Handle paginated response
      if (response.data.results) {
        setLoans(response.data.results);
        setTotalCount(response.data.count);
        setTotalPages(Math.ceil(response.data.count / pageSize));
      } else {
        // Fallback for non-paginated response
        const data = response.data || [];
        setLoans(Array.isArray(data) ? data : []);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      setError(intl.formatMessage({ id: 'failedToLoadLoans' }));
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (loanId, newStatus) => {
    try {
      setActionLoading(loanId);
      await api.post(`/api/loans/loans/${loanId}/update_status/`, { status: newStatus });
      fetchLoans();
    } catch (error) {
      console.error('Error updating loan status:', error);
      setError(intl.formatMessage({ id: 'failedToUpdateLoanStatus' }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (!window.confirm(intl.formatMessage({ id: 'confirmDeleteLoan' }))) {
      return;
    }
    try {
      setActionLoading(loanId);
      await api.delete(`/api/loans/loans/${loanId}/`);
      setError('');
      fetchLoans();
    } catch (error) {
      console.error('Error deleting loan:', error);
      setError(intl.formatMessage({ id: 'failedToDeleteLoan' }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
    console.log('View loan details for:', loan);
  };

  const handleEditLoan = (loan) => {
    navigate(`/admin/loans/${loan.id}/edit`);
  };

  const handleCreateLoan = () => {
    navigate('/dashboard/admin/loans/create');
  };

  const handleViewLaureate = (loan) => {
    if (loan.laureate_info?.id) {
      navigate(`/admin/laureates/${loan.laureate_info.id}/edit`);
    }
  };

  // Handle search with debouncing
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
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

  // Calculate stats for current page
  const stats = {
    total: totalCount,
    active: loans.filter(l => l.status === 'active').length,
    completed: loans.filter(l => l.status === 'completed').length,
    overdue: loans.filter(l => l.status === 'overdue').length,
    totalAmount: loans.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0),
    totalRemaining: loans.reduce((sum, l) => sum + parseFloat(l.remaining_balance || 0), 0)
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {intl.formatMessage({ id: 'loanManagement' })}
          </h1>
          <p className="text-muted-foreground">
            {intl.formatMessage({ id: 'manageScholarshipLoans' })}
          </p>
        </div>
        <Button onClick={handleCreateLoan} className="md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {intl.formatMessage({ id: 'createNewLoan' })}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'totalLoans' })}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'activeLoans' })}
                </p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'totalAmount' })}
                </p>
<p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'outstanding' })}
                </p>
<p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalRemaining)}</p>              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>{intl.formatMessage({ id: 'searchAndFilter' })}</CardTitle>
          <CardDescription>{intl.formatMessage({ id: 'findLoans' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={intl.formatMessage({ id: 'searchLoansPlaceholder' })}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('all')}
              >
                <Filter className="h-4 w-4 mr-1" />
                {intl.formatMessage({ id: 'allFilter' })} ({stats.total})
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('active')}
              >
                {intl.formatMessage({ id: 'activeFilter' })} ({stats.active})
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('completed')}
              >
                {intl.formatMessage({ id: 'completedFilter' })} ({stats.completed})
              </Button>
              <Button
                variant={filterStatus === 'overdue' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('overdue')}
              >
                {intl.formatMessage({ id: 'overdueFilter' })} ({stats.overdue})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {intl.formatMessage({ id: 'loans' })} ({loans.length} of {totalCount})
              </CardTitle>
              <CardDescription>
                {searchTerm
                  ? intl.formatMessage({ id: 'showingResultsFor' }, { searchTerm })
                  : intl.formatMessage({ id: 'allScholarshipLoans' })}
              </CardDescription>
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">
                  {intl.formatMessage({ id: 'loadingLoans' })}
                </span>
              </div>
            </div>
          ) : loans.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {intl.formatMessage({ id: 'noLoansFound' })}
              </p>
              <p className="text-sm">
                {searchTerm
                  ? intl.formatMessage({ id: 'adjustSearchCriteria' })
                  : intl.formatMessage({ id: 'startByCreatingLoan' })}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={handleCreateLoan}>
                  <Plus className="h-4 w-4 mr-2" />
                  {intl.formatMessage({ id: 'createFirstLoan' })}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {intl.formatMessage({ id: 'loanId' })}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {intl.formatMessage({ id: 'laureate' })}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {intl.formatMessage({ id: 'amount' })}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                        {intl.formatMessage({ id: 'remaining' })}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                        {intl.formatMessage({ id: 'monthlyPayment' })}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {intl.formatMessage({ id: 'status' })}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">
                        {intl.formatMessage({ id: 'startDate' })}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        {intl.formatMessage({ id: 'actions' })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                            #{loan.id}
                          </code>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">
                            {loan.laureate_name || loan.laureate_info?.full_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {loan.laureate_info?.student_id}
                          </div>
                        </td>
                        <td className="p-4">
<div className="font-bold">{formatCurrency(loan.amount)}</div>                        </td>
                        <td className="p-4 hidden md:table-cell">
<div className="font-medium">{formatCurrency(loan.remaining_balance)}</div>                          <div className="text-xs text-muted-foreground">
                            {loan.remaining_balance && loan.amount ?
                              intl.formatMessage({ id: 'percentLeft' }, { percent: Math.round((loan.remaining_balance / loan.amount) * 100) }) :
                              intl.formatMessage({ id: 'na' })}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
{formatCurrency(loan.monthly_payment)}                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusColor(loan.status)}>
                            {intl.formatMessage({ id: `${loan.status}Status` })}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm hidden lg:table-cell">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(loan.start_date).toLocaleDateString(intl.locale)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewLoan(loan)}
                              className="h-8 w-8 p-0"
                              title={intl.formatMessage({ id: 'viewLoanDetails' })}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">{intl.formatMessage({ id: 'viewLoanDetails' })}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLoan(loan)}
                              className="h-8 w-8 p-0"
                              title={intl.formatMessage({ id: 'editLoan' })}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">{intl.formatMessage({ id: 'editLoan' })}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLoan(loan.id)}
                              className="h-8 w-8 p-0"
                              disabled={actionLoading === loan.id || parseFloat(loan.total_paid || 0) > 0}
                              title={parseFloat(loan.total_paid || 0) > 0 ? intl.formatMessage({ id: 'cannotDeleteLoanWithPayments' }) : intl.formatMessage({ id: 'deleteLoan' })}
                            >
                              {actionLoading === loan.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">{intl.formatMessage({ id: 'deleteLoan' })}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} loans
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {getPageNumbers().map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-10"
                            onClick={() => handlePageClick(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Loan Details Modal */}
      {selectedLoan && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {intl.formatMessage({ id: 'loanDetails' }, { id: selectedLoan.id })}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLoan(null)}
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
                    {intl.formatMessage({ id: 'laureate' })}
                  </p>
                  <p className="font-medium">{selectedLoan.laureate_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'totalAmount' })}
                  </p>
                  <p className="text-lg font-bold">${selectedLoan.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'remainingBalance' })}
                  </p>
                  <p className="text-lg font-bold text-orange-600">${selectedLoan.remaining_balance?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'monthlyPayment' })}
                  </p>
                  <p className="font-medium">${selectedLoan.monthly_payment?.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'startDate' })}
                  </p>
                  <p>{new Date(selectedLoan.start_date).toLocaleDateString(intl.locale)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'endDate' })}
                  </p>
                  <p>{new Date(selectedLoan.end_date).toLocaleDateString(intl.locale)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'interestRate' })}
                  </p>
                  <p>{selectedLoan.interest_rate}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {intl.formatMessage({ id: 'status' })}
                  </p>
                  <Badge variant={getStatusColor(selectedLoan.status)}>
                    {intl.formatMessage({ id: `${selectedLoan.status}Status` })}
                  </Badge>
                </div>
              </div>
            </div>
            {selectedLoan.notes && (
              <div className="mt-4 p-3 bg-muted rounded">
                <p className="text-sm font-medium mb-1">{intl.formatMessage({ id: 'notes' })}:</p>
                <p className="text-sm">{selectedLoan.notes}</p>
              </div>
            )}
            <div className="flex space-x-2 mt-6">
              <Button onClick={() => handleEditLoan(selectedLoan)}>
                <Edit className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'editLoan' })}
              </Button>
              <Button variant="outline" onClick={() => handleViewLaureate(selectedLoan)}>
                <User className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'viewLaureate' })}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/payments?loan=${selectedLoan.id}`)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'paymentHistory' })}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteLoan(selectedLoan.id)}
                disabled={actionLoading === selectedLoan.id || parseFloat(selectedLoan.total_paid || 0) > 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'deleteLoan' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LoanManagement;