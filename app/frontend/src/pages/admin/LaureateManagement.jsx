import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Eye,
  Filter,
  Users,
  Mail,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Loader2,
  UserCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { intl } from '@/i18n';
import api from '@/login/api';

function LaureateManagement() {
  const navigate = useNavigate();
  const [laureates, setLaureates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [error, setError] = useState('');
  const [selectedLaureate, setSelectedLaureate] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchLaureates();
  }, [currentPage, searchTerm, filterActive]);

  const fetchLaureates = async () => {
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
      
      if (filterActive !== 'all') {
        params.append('is_active', filterActive === 'active' ? 'true' : 'false');
      }
      
      const response = await api.get(`/api/laureates/laureates/?${params}`);
      console.log('Laureates data:', response.data);
      
      // Handle paginated response
      if (response.data.results) {
        setLaureates(response.data.results);
        setTotalCount(response.data.count);
        setTotalPages(Math.ceil(response.data.count / pageSize));
      } else {
        // Fallback for non-paginated response
        const data = response.data || [];
        setLaureates(Array.isArray(data) ? data : []);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching laureates:', error);
      setError(intl.formatMessage({ id: 'failedToLoadLaureates' }));
      setLaureates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (laureateId, currentStatus) => {
    try {
      setActionLoading(laureateId);
      await api.post(`/api/laureates/laureates/${laureateId}/toggle_status/`);
      fetchLaureates(); // Refresh the list
    } catch (error) {
      console.error('Error toggling laureate status:', error);
      setError(intl.formatMessage({ id: 'failedToUpdateLaureateStatus' }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProfile = (laureate) => {
    setSelectedLaureate(laureate);
    console.log('View profile for:', laureate);
  };

  const handleViewApplications = () => {
    navigate('/dashboard/admin/applications');
  };

  const handleCreateLaureates = () => {
    navigate('/dashboard/admin/createlaureates');
  };

  // Handle search with debouncing
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterActive(status);
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

  // Calculate stats for current page
  const stats = {
    total: totalCount,
    active: laureates.filter(l => l.is_active).length,
    inactive: laureates.filter(l => !l.is_active).length,
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
      {/* Header with Create Button */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {intl.formatMessage({ id: 'laureateManagement' })}
          </h1>
          <p className="text-muted-foreground">
            {intl.formatMessage({ id: 'manageScholarshipRecipients' })}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleCreateLaureates} className="md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Laureates
          </Button>
          <Button onClick={handleViewApplications} className="md:w-auto" variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            {intl.formatMessage({ id: 'reviewApplications' })}
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <UserCheck className="h-4 w-4" />
        <AlertDescription>
          {intl.formatMessage({ id: 'laureatesCreatedInfo' })}
        </AlertDescription>
      </Alert>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'totalLaureates' })}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'active' })}
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
                  {intl.formatMessage({ id: 'inactive' })}
                </p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>{intl.formatMessage({ id: 'searchAndFilter' })}</CardTitle>
          <CardDescription>{intl.formatMessage({ id: 'findLaureates' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={intl.formatMessage({ id: 'searchLaureatesPlaceholder' })}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterActive === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('all')}
              >
                <Filter className="h-4 w-4 mr-1" />
                {intl.formatMessage({ id: 'allFilter' })} ({stats.total})
              </Button>
              <Button
                variant={filterActive === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('active')}
              >
                {intl.formatMessage({ id: 'activeFilter' })} ({stats.active})
              </Button>
              <Button
                variant={filterActive === 'inactive' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('inactive')}
              >
                {intl.formatMessage({ id: 'inactiveFilter' })} ({stats.inactive})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Laureates Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {intl.formatMessage({ id: 'laureates' })} ({laureates.length} of {totalCount})
              </CardTitle>
              <CardDescription>
                {searchTerm
                  ? intl.formatMessage({ id: 'showingResultsFor' }, { searchTerm })
                  : intl.formatMessage({ id: 'allApprovedRecipients' })}
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
                  {intl.formatMessage({ id: 'loadingLaureates' })}
                </span>
              </div>
            </div>
          ) : laureates.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {intl.formatMessage({ id: 'noLaureatesFound' })}
              </p>
              <p className="text-sm">
                {searchTerm
                  ? intl.formatMessage({ id: 'adjustSearchCriteria' })
                  : intl.formatMessage({ id: 'noApprovedLaureates' })}
              </p>
              {!searchTerm && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {intl.formatMessage({ id: 'laureatesCreatedNote' })}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleCreateLaureates}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Laureates
                    </Button>
                    <Button variant="outline" onClick={handleViewApplications}>
                      <Clock className="h-4 w-4 mr-2" />
                      {intl.formatMessage({ id: 'checkPendingApplications' })}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
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
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                        {intl.formatMessage({ id: 'email' })}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">
                        {intl.formatMessage({ id: 'institution' })}
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">
                        {intl.formatMessage({ id: 'fieldOfStudy' })}
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
                    {laureates.map((laureate) => (
                      <tr key={laureate.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                            {laureate.student_id}
                          </code>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{laureate.full_name}</div>
                          <div className="text-sm text-muted-foreground md:hidden">
                            {laureate.email}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{laureate.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm hidden lg:table-cell">
                          <div className="flex items-center space-x-1">
                            <GraduationCap className="h-3 w-3 text-muted-foreground" />
                            <span>{laureate.institution || intl.formatMessage({ id: 'notSpecified' })}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm hidden lg:table-cell">
                          {laureate.field_of_study || intl.formatMessage({ id: 'notSpecified' })}
                        </td>
                        <td className="p-4">
                          <Badge variant={laureate.is_active ? "default" : "secondary"}>
                            {laureate.is_active ? intl.formatMessage({ id: 'active' }) : intl.formatMessage({ id: 'inactive' })}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProfile(laureate)}
                              className="h-8 w-8 p-0"
                              title={intl.formatMessage({ id: 'viewProfile' })}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">{intl.formatMessage({ id: 'viewProfile' })}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(laureate.id, laureate.is_active)}
                              className="h-8 w-8 p-0"
                              disabled={actionLoading === laureate.id}
                              title={laureate.is_active ? intl.formatMessage({ id: 'deactivateLaureate' }) : intl.formatMessage({ id: 'activateLaureate' })}
                            >
                              {actionLoading === laureate.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : laureate.is_active ? (
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <span className="sr-only">
                                {laureate.is_active ? intl.formatMessage({ id: 'deactivate' }) : intl.formatMessage({ id: 'activate' })}
                              </span>
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
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} laureates
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

      {/* Selected Laureate Details Modal/Card */}
      {selectedLaureate && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {intl.formatMessage(
                  { id: 'laureateDetails' },
                  { fullName: selectedLaureate.full_name }
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLaureate(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'studentId' })}
                </p>
                <p className="font-mono">{selectedLaureate.student_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'email' })}
                </p>
                <p>{selectedLaureate.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'institution' })}
                </p>
                <p>{selectedLaureate.institution || intl.formatMessage({ id: 'notSpecified' })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'fieldOfStudy' })}
                </p>
                <p>{selectedLaureate.field_of_study || intl.formatMessage({ id: 'notSpecified' })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'status' })}
                </p>
                <Badge variant={selectedLaureate.is_active ? "default" : "secondary"}>
                  {selectedLaureate.is_active ? intl.formatMessage({ id: 'active' }) : intl.formatMessage({ id: 'inactive' })}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {intl.formatMessage({ id: 'graduationYear' })}
                </p>
                <p>{selectedLaureate.graduation_year || intl.formatMessage({ id: 'notSpecified' })}</p>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'sendEmail' })}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleToggleStatus(selectedLaureate.id, selectedLaureate.is_active)}
                disabled={actionLoading === selectedLaureate.id}
              >
                {selectedLaureate.is_active ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {intl.formatMessage({ id: 'deactivate' })}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {intl.formatMessage({ id: 'activate' })}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LaureateManagement;