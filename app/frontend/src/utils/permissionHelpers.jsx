// src/utils/permissionHelpers.js
export const hasPermission = (requiredPermission) => {
    const permissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
    // console.log(permissions)
    return permissions.includes(requiredPermission);
  };
  
  export const hasAnyPermission = (requiredPermissions) => {
    const permissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
    return requiredPermissions.some(perm => permissions.includes(perm));
  };