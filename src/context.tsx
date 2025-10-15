// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Admin {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  assignedSections: string[];
  permissions: {
    canManageStudents: boolean;
    canManageTeachers: boolean;
    canManageCourses: boolean;
    canViewAnalytics: boolean;
  };
}

interface AuthContextType {
  admin: Admin | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on component mount
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const adminId = localStorage.getItem('adminId');
      
      if (token && adminId) {
        try {
          // Verify token with backend
          const response = await fetch(`/api/admin/${adminId}/dashboard`);
          if (response.ok) {
            const data = await response.json();
            setAdmin({
              id: adminId,
              username: data.adminInfo.username,
              email: data.adminInfo.email || '',
              firstName: data.adminInfo.firstName || '',
              lastName: data.adminInfo.lastName || '',
              assignedSections: data.adminInfo.assignedSections,
              permissions: data.adminInfo.permissions
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminId');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminId');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store auth data
        localStorage.setItem('adminToken', 'your-auth-token'); // Replace with actual token
        localStorage.setItem('adminId', data.user.id);
        
        setAdmin({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          assignedSections: data.user.assignedSections,
          permissions: data.user.permissions
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    setAdmin(null);
  };

  const value: AuthContextType = {
    admin,
    login,
    logout,
    isLoading,
    isAuthenticated: !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};