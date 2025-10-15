import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  rolesAllowed: string[];
  userRole: string | null;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  rolesAllowed, 
  userRole, 
  fallbackPath = '/' 
}) => {
  const hasAccess = userRole && rolesAllowed.includes(userRole);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;