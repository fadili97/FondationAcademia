export const hasPermission = (requiredPermission) => {
  const permissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
  return permissions.includes(requiredPermission);
};

export const hasAnyPermission = (requiredPermissions) => {
  const permissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
  return requiredPermissions.some(perm => permissions.includes(perm));
};

// ✅ ADD: New functions for role checking
export const getUserInfo = () => {
  try {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    
    // Fallback: decode from token
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      user_id: payload.user_id,
      username: payload.username,
      email: payload.email,
      full_name: payload.full_name,
      is_superuser: payload.is_superuser || false,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

export const getUserRole = () => {
  const userInfo = getUserInfo();
  return userInfo?.is_superuser ? 'admin' : 'laureate';
};

export const isAdmin = () => {
  const userInfo = getUserInfo();
  return userInfo?.is_superuser === true;
};

export const isLaureate = () => {
  const userInfo = getUserInfo();
  return userInfo?.is_superuser === false;
};

export const clearUserData = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem('user_info');
};