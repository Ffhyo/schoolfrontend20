// App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './route';
import ProtectedRoute from './components/protectedRouted';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  // Sync role from localStorage on mount and listen for storage changes
  useEffect(() => {
    const updateRole = () => {
      const role = localStorage.getItem('role');
      setUserRole(role);
    };

    // Initial role setup
    updateRole();

    // Listen for storage changes (when Navbar updates localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'role') {
        updateRole();
      }
    };

    // Listen for custom event from Navbar when role changes
    const handleRoleChange = () => {
      updateRole();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('roleChanged', handleRoleChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roleChanged', handleRoleChange);
    };
  }, []);

  // Render all routes
  const renderAllRoutes = () => {
    return routes.map((route: any) => {
      const Layout = route.layout || React.Fragment;
      const rolesAllowed = route.rolesAllowed;

      // Handle routes with children
      if (route.children) {
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              rolesAllowed ? (
                <ProtectedRoute 
                  rolesAllowed={rolesAllowed} 
                  userRole={userRole}
                  fallbackPath="/"
                >
                  <Layout />
                </ProtectedRoute>
              ) : (
                <Layout />
              )
            }
          >
            {route.children.map((child: any) => (
              <Route
                key={child.path || child.index}
                index={child.index}
                path={child.path}
                element={
                  child.rolesAllowed ? (
                    <ProtectedRoute 
                      rolesAllowed={child.rolesAllowed} 
                      userRole={userRole}
                      fallbackPath="/"
                    >
                      {React.createElement(child.element)}
                    </ProtectedRoute>
                  ) : (
                    React.createElement(child.element)
                  )
                }
              />
            ))}
          </Route>
        );
      }

      // Handle simple routes
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            rolesAllowed ? (
              <ProtectedRoute 
                rolesAllowed={rolesAllowed} 
                userRole={userRole}
                fallbackPath="/"
              >
                {React.createElement(route.element)}
              </ProtectedRoute>
            ) : (
              React.createElement(route.element)
            )
          }
        />
      );
    });
  };

  return (
    <Router>
      <Routes>
        {renderAllRoutes()}
      </Routes>
    </Router>
  );
};

export default App;