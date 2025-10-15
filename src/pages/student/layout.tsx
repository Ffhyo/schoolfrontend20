import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const StudentLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('role'); // clear role on logout
    navigate('/'); // redirect to homepage or login
  };
    const navItems = [
    { path: 'dashboard', label: ' Dashboard', icon: '📊' },
   // { path: 'classes', label: ' My Classes', icon: '🏫' },
    { path: 'Assignment', label: ' Assignment', icon: '👥' },
   // { path: 'profile', label: ' Profile', icon: '👤' },
   // {path:'report', label:'report',icon: '📊'}
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white flex justify-between items-center p-4 shadow-md">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
         <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
                  <nav className="flex flex-col gap-2 p-4">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === 'dashboard'}
                        className={({ isActive }) =>
                          `px-4 py-3 rounded-lg transition-all duration-200 font-medium flex items-center space-x-3 ${
                            isActive 
                              ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`
                        }
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    ))} 
                    </nav>
                    </aside>

        {/* Main content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet /> {/* Render nested routes like Dashboard, Users, etc. */}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
