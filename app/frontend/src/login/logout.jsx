import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

function Logout() {
  // Clear all tokens and user info from local storage
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem('user_info'); // ✅ ADD THIS
  
  // Redirect to login page
  return <Navigate to="/" />;
}

export default Logout;