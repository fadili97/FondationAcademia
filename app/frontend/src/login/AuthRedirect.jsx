// Alternative simpler version - @/login/AuthRedirect.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '@/login/permissions';

const AuthRedirect = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const userRole = getUserRole();

  useEffect(() => {
    // Small delay to ensure proper authentication check
    const checkAuth = () => {
      if (userRole) {
        // User is logged in, redirect
        if (userRole === 'admin') {
          navigate('/dashboard/admin', { replace: true });
        } else if (userRole === 'laureate') {
          navigate('/laureate', { replace: true });
        }
      } else {
        // User is not logged in, allow access to auth pages
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [userRole, navigate]);

  // Show loading while checking
  if (isChecking) {
    return <div>Loading...</div>;
  }

  // User is not logged in, show the auth form
  return children;
};

export default AuthRedirect;