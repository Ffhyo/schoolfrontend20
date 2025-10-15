// TeacherLayout.tsx
import ChatBot from '@/components/chatcomponent';
import React from 'react';
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';

const TeacherLayout: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentTeacher = JSON.parse(localStorage.getItem('currentTeacher') || '{}');
  const teacherName = currentTeacher.name || currentTeacher.username || 'Teacher';

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('currentTeacher');
    navigate('/');
  };

  // Navigation items - use relative paths
  const navItems = [
    { path: 'dashboard', label: ' Dashboard', icon: '📊' },
    { path: 'classes', label: ' My Classes', icon: '🏫' },
    { path: 'students', label: ' Students', icon: '👥' },
    { path: 'profile', label: ' Profile', icon: '👤' },
    {path:'report', label:'report',icon: '📊'}
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Teacher Portal</h1>
            <span className="text-blue-200">Welcome, {teacherName}</span>
            {id && (
              <span className="text-xs bg-blue-500 px-2 py-1 rounded">
                ID: {id}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Logout
          </button>
        </div>
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
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <ChatBot />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;