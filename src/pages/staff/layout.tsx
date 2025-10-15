import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const StaffLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('role'); // clear role on logout
    navigate('/'); // redirect to homepage or login
  };

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
        <aside className="w-64 bg-gray-100 p-4 border-r border-gray-300">
          <nav className="flex flex-col gap-3">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-300 font-bold' : ''}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `px-3 py-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-300 font-bold' : ''}`
              }
            >
              Manage Users
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `px-3 py-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-300 font-bold' : ''}`
              }
            >
              Settings
            </NavLink>
            {/* Add more admin links here */}
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

export default StaffLayout;
