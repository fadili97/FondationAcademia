import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import NotFound from './404';
import Login from '@/login/Login';
import Register from '@/components/Register';
import ProtectedRoute from '../login/protectedroute';
import RoleBasedRoute from '../login/RoleBasedRoute';
import Logout from '../login/logout';
import Unauthorized from '@/components/Unauthorized';
import AuthRedirect from '@/login/AuthRedirect';

// Public Components
import HomePage from '@/pages/public/HomePage';

// Admin Components
import AdminDashboard from '@/pages/admin/AdminDashboard';
import LaureateManagement from '@/pages/admin/LaureateManagement';
import LaureateEditForm from '@/pages/admin/LaureateEditForm';
import ApplicationsReview from '@/pages/admin/ApplicationsReview';
import LoanManagement from '@/pages/admin/LoanManagement';
import ReportsManagement from '@/pages/admin/ReportsManagement';
import OverdueManagement from '@/pages/admin/OverdueManagement';
import LoanCreateForm from '@/pages/admin/LoanCreateForm';
import LoanEditForm from '@/pages/admin/LoanEditForm';
import PaymentManagement from '@/pages/admin/PaymentManagement';

// Laureate Components
import LaureateDashboard from '@/pages/laureate/LaureateDashboard';
import LaureateProfile from '@/pages/laureate/LaureateProfile';
import LoanHistory from '@/pages/laureate/LoanHistory';
import RepaymentSchedule from '@/pages/laureate/RepaymentSchedule';
import CreateLaureate from '@/pages/admin/CreateLaureate';



const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
     <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />

      {/* Protected Admin Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      >
        <Route
          path="admin"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/laureates"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <LaureateManagement />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/laureates/:id/edit"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <LaureateEditForm />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/applications"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <ApplicationsReview />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/loans"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <LoanManagement />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/createlaureates"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <CreateLaureate />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/loans/create"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <LoanCreateForm />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/loans/:id/edit"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <LoanEditForm />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/payments"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <PaymentManagement />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/overdue"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <OverdueManagement />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/reports"
          element={
            <RoleBasedRoute requireAdmin={true}>
              <ReportsManagement />
            </RoleBasedRoute>
          }
        />
      </Route>

      {/* Protected Laureate Routes */}
      <Route
        path="/laureate"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <RoleBasedRoute requireLaureate={true}>
              <LaureateDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <RoleBasedRoute requireLaureate={true}>
              <LaureateProfile />
            </RoleBasedRoute>
          }
        />
        <Route
          path="loans"
          element={
            <RoleBasedRoute requireLaureate={true}>
              <LoanHistory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="repayments"
          element={
            <RoleBasedRoute requireLaureate={true}>
              <RepaymentSchedule />
            </RoleBasedRoute>
          }
        />
      </Route>

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </>
  )
);

export default router;