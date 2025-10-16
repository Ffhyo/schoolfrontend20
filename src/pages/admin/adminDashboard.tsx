import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, UserCog, BookOpen, BarChart3, TrendingUp, Eye, RefreshCw } from 'lucide-react';

interface DashboardData {
  adminInfo: {
    name: string;
    username: string;
    assignedSections: string[];
    permissions: any;
    loginCount: number;
    lastLogin: string;
  };
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    assignedSections: number;
    studentGrowth: number;
    teacherGrowth: number;
  };
  recentStudents: any[];
  adminActivity: any[];
}
const API_BASE_URL ='https://schoolbackend-un9x.onrender.com'
const AdminDashboard: React.FC = () => {
  const { adminId } = useParams();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!adminId) {
        throw new Error('Admin ID not found');
      }

      const response = await fetch(`${API_BASE_URL}/${adminId}/dashboard`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchDashboardData();
    }
  }, [adminId]);

  const statCards = [
    {
      title: 'Total Students',
      value: dashboardData?.stats.totalStudents || 0,
      change: `+${dashboardData?.stats.studentGrowth || 0}%`,
      icon: Users,
      color: 'blue',
      description: 'Student growth this month'
    },
    {
      title: 'Teaching Staff',
      value: dashboardData?.stats.totalTeachers || 0,
      change: `+${dashboardData?.stats.teacherGrowth || 0}%`,
      icon: UserCog,
      color: 'green',
      description: 'Teacher growth this month'
    },
    {
      title: 'Courses',
      value: dashboardData?.stats.totalCourses || 0,
      change: '+8%',
      icon: BookOpen,
      color: 'purple',
      description: 'Active courses'
    },
    {
      title: 'Assigned Sections',
      value: dashboardData?.stats.assignedSections || 0,
      change: 'Active',
      icon: BarChart3,
      color: 'orange',
      description: 'Sections managed'
    }
  ];

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error Loading Dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-gray-500 text-center">
          <p className="text-lg font-semibold">No Data Available</p>
          <p className="text-sm">Unable to load dashboard data</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to your management dashboard</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {dashboardData.adminInfo.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening in your academy today.  
            </p>
            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="text-blue-200">Managed Sections:</span>
                <span className="ml-2 font-semibold">
                  {dashboardData.adminInfo.assignedSections.join(', ') || 'All Sections'}
                </span>
              </div>
              <div>
                <span className="text-blue-200">Login Count:</span>
                <span className="ml-2 font-semibold">{dashboardData.adminInfo.loginCount}</span>
              </div>
              <div>
                <span className="text-blue-200">Last Login:</span>
                <span className="ml-2 font-semibold">
                  {new Date(dashboardData.adminInfo.lastLogin).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 p-3 rounded-lg">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 border-blue-200 text-blue-700',
            green: 'bg-green-50 border-green-200 text-green-700',
            purple: 'bg-purple-50 border-purple-200 text-purple-700',
            orange: 'bg-orange-50 border-orange-200 text-orange-700'
          };
          
          return (
            <div 
              key={index} 
              className={`bg-white rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-md ${
                colorClasses[stat.color as keyof typeof colorClasses]
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-semibold opacity-75">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className="bg-white/50 p-2 rounded-lg">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className={`text-sm font-medium ${
                stat.change.includes('+') ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Students</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.recentStudents.map((student) => (
              <div 
                key={student._id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div>
                  <p className="font-medium">{student.firstName} {student.lastName}</p>
                  <p className="text-sm text-gray-600">
                    Grade {student.grade} • {student.house ? student.house.replace('-', ' ') : 'No House'}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            ))}
            {dashboardData.recentStudents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent students found</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.adminActivity.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
            {dashboardData.adminActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;