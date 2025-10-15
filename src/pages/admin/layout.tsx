import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut,
  UserCog,
  GraduationCap,
  BarChart3,
  ChevronDown,
  ChevronRight,
  User,
  Award,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { adminId } = useParams();
  const location = useLocation();
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('currentAdmin');
    navigate('/');
  };

  const toggleStudentDropdown = () => {
    setStudentDropdownOpen(!studentDropdownOpen);
  };

  // Safe navigation items with fallback for adminId
  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/admin/${adminId}/dashboard`,
      icon: LayoutDashboard,
      description: 'Overview and analytics'
    },
    {
      name: 'Students',
      type: 'dropdown',
      icon: GraduationCap,
      description: 'Manage student records',
      items: [
        {
          name: 'All Students',
          href: `/admin/${adminId}/students`,
          icon: Users,
          description: 'View all students'
        },
        {
          name: 'Student Profiles',
          href: `/admin/${adminId}/students/profiles`,
          icon: User,
          description: 'Student details and information'
        },
        {
          name: 'Attendance',
          href: `/admin/${adminId}/students/attendance`,
          icon: Calendar,
          description: 'Manage student attendance'
        },
        {
          name: 'Grades & Marks',
          href: `/admin/${adminId}/students/grades`,
          icon: Award,
          description: 'Academic performance'
        },
        {
          name: 'Fee Management',
          href: `/admin/${adminId}/students/fees`,
          icon: CreditCard,
          description: 'Fee records and payments'
        },
        {
          name: 'Reports',
          href: `/admin/${adminId}/students/reports`,
          icon: FileText,
          description: 'Student reports and analytics'
        }
      ]
    },
    {
      name: 'Teachers',
      href: `/admin/${adminId}/teachers`,
      icon: UserCog,
      description: 'Manage teaching staff'
    },
    {
      name: 'Courses',
      href: `/admin/${adminId}/courses`,
      icon: BookOpen,
      description: 'Course management'
    },
    {
      name: 'Analytics',
      href: `/admin/${adminId}/analytics`,
      icon: BarChart3,
      description: 'Reports and insights'
    },
    {
      name: 'Settings',
      href: `/admin/${adminId}/settings`,
      icon: Settings,
      description: 'System configuration'
    },
  ];

  // Helper function to safely generate paths
  const getSafePath = (path: string): string => {
    return adminId ? path : '/admin/dashboard'; // Fallback to dashboard if adminId is undefined
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Sunflower Academy Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin ID: {adminId || 'N/A'}</p>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              
              if (item.type === 'dropdown') {
                return (
                  <div key={item.name} className="space-y-1">
                    {/* Dropdown Header */}
                    <button
                      onClick={toggleStudentDropdown}
                      className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-200 group ${
                        studentDropdownOpen
                          ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${
                          studentDropdownOpen ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                        <div className="text-left">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      {studentDropdownOpen ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>

                    {/* Dropdown Items */}
                    {studentDropdownOpen && (
                      <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-3">
                        {item.items?.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <NavLink
                              key={subItem.name}
                              to={getSafePath(subItem.href)} // Use safe path
                              className={({ isActive }) =>
                                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                                  isActive
                                    ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`
                              }
                            >
                              <SubIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{subItem.name}</p>
                                <p className="text-xs text-gray-500 truncate">{subItem.description}</p>
                              </div>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Regular navigation item
              return (
                <NavLink
                  key={item.name}
                 to={item.href || '/admin/dashboard'}// Use safe path
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className={`h-5 w-5 ${
                    location.pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Stats Section */}
          <div className="p-4 border-t border-gray-200 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Students</span>
                <span className="font-semibold text-blue-600">1,247</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Teachers</span>
                <span className="font-semibold text-green-600">84</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Courses</span>
                <span className="font-semibold text-purple-600">56</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;