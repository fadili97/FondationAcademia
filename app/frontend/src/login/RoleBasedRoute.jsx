import { Navigate } from "react-router-dom";
import { getUserInfo } from "./permissions";

function RoleBasedRoute({ children, requireAdmin = false, requireLaureate = false, fallbackPath = "/unauthorized" }) {
  const userInfo = getUserInfo();
  const isAdmin = userInfo?.is_superuser === true;
  const isLaureate = userInfo?.is_superuser === false;

  if (requireAdmin && !isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  if (requireLaureate && !isLaureate) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export default RoleBasedRoute;
