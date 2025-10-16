import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Teacher {
  _id: string;
  name: string;
  username: string;
  employmentType: string;
  experience: number;
  isActive: boolean;
  joinDate: string;
  performance: string;
  permissions: {
    canGradeStudents: boolean;
    canTakeAttendance: boolean;
    canCreateAssignments: boolean;
    canViewAllStudents: boolean;
    canManageClass: boolean;
  };
  attendance: {
    present: number;
    absent: number;
    leave: number;
  };
  ratings: {
    average: number;
    count: number;
    reviews: any[];
  };
  subjects: string[];
  assignedClasses: string[];
  students: string[];
  schedule: any;
}

interface Activity {
  id: number;
  type: 'student' | 'teacher' | 'course' | 'attendance';
  message: string;
  timestamp: string;
  user: string;
}

interface Stats {
  students: number;
  teachers: number;
  courses: number;
  attendance: number;
  performance: string;
}

const TeacherDashboard: React.FC = () => {
  const { id: paramId } = useParams();
  const currentTeacher = JSON.parse(localStorage.getItem('currentTeacher') || '{}');
  const id = paramId || currentTeacher.id;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [stats, setStats] = useState<Stats>({
    students: 0,
    teachers: 0,
    courses: 0,
    attendance: 0,
    performance: 'good'
  });
  console.log(stats)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacher = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/teachers/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch teacher data');
      }
      const data = await response.json();
      setTeacher(data);
      
      // Update stats with actual teacher data
      setStats(prev => ({
        ...prev,
        students: data.students?.length || 0,
        attendance: data.attendance?.present || 0,
        performance: data.performance || 'good'
      }));
      
      return data;
    } catch (err) {
      console.error('Error fetching teacher:', err);
      setError('Failed to load teacher data');
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const teacherData = await fetchTeacher();
      
      if (teacherData) {
        // Generate dynamic activities based on teacher data
        const dynamicActivities: Activity[] = [
          {
            id: 1,
            type: 'teacher',
            message: `joined Sunflower Academy as ${teacherData.employmentType} staff`,
            timestamp: new Date(teacherData.joinDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            user: teacherData.name
          },
          {
            id: 2,
            type: 'attendance',
            message: `marked ${teacherData.attendance?.present || 0} present days this month`,
            timestamp: 'Today',
            user: 'You'
          }
        ];

        // Add more activities based on teacher permissions and data
        if (teacherData.permissions?.canTakeAttendance) {
          dynamicActivities.push({
            id: 3,
            type: 'attendance',
            message: 'can take attendance for assigned classes',
            timestamp: 'System',
            user: 'Permissions'
          });
        }

        if (teacherData.subjects && teacherData.subjects.length > 0) {
          dynamicActivities.push({
            id: 4,
            type: 'course',
            message: `teaching ${teacherData.subjects.length} subjects`,
            timestamp: 'Current',
            user: 'You'
          });
        }

        setRecentActivities(dynamicActivities);
      }
      
      // Simulate additional data loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDashboardData();
    }
  }, [id]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student':
        return '👨‍🎓';
      case 'teacher':
        return '👩‍🏫';
      case 'course':
        return '📚';
      case 'attendance':
        return '✅';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'student':
        return 'text-blue-600';
      case 'teacher':
        return 'text-yellow-600';
      case 'course':
        return 'text-red-600';
      case 'attendance':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance?.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'average':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalAttendance = () => {
    if (!teacher?.attendance) return 0;
    const { present, absent, leave } = teacher.attendance;
    const total = present + absent + leave;
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold text-xl mb-2">Error Loading Dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-blue-800 font-semibold">Loading Sunflower Academy Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            🌻 Sunflower Academy
          </h1>
          <p className="text-yellow-600 font-semibold">Empowering Minds, Growing Futures</p>
        </header>

        {/* Welcome section */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Welcome back, {teacher?.name || 'Teacher'}!
              </h2>
              <p className="text-gray-600 text-lg mb-3">
                {teacher?.employmentType ? `${teacher.employmentType} Teacher` : "Here's what's happening at Sunflower Academy today."}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {teacher?.employmentType && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEmploymentTypeColor(teacher.employmentType)}`}>
                    {teacher.employmentType}
                  </span>
                )}
                {teacher?.performance && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 ${getPerformanceColor(teacher.performance)}`}>
                    Performance: {teacher.performance}
                  </span>
                )}
                {teacher?.experience !== undefined && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    {teacher.experience} years experience
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 bg-yellow-100 px-4 py-2 rounded-full">
              <span className="text-yellow-800 font-semibold">
                📅 {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </section>

        {/* Stats section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Assigned Students</p>
                <p className="text-3xl font-bold mt-2">{teacher?.students?.length || 0}</p>
              </div>
              <div className="text-3xl">👨‍🎓</div>
            </div>
            <div className="mt-4 text-blue-200 text-sm">
              {teacher?.assignedClasses?.length || 0} classes
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Attendance Rate</p>
                <p className="text-3xl font-bold mt-2">{calculateTotalAttendance()}%</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="mt-4 text-yellow-200 text-sm">
              {teacher?.attendance?.present || 0} present days
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Teaching Subjects</p>
                <p className="text-3xl font-bold mt-2">{teacher?.subjects?.length || 0}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
            <div className="mt-4 text-red-200 text-sm">
              {teacher?.subjects?.join(', ') || 'No subjects assigned'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Teacher Rating</p>
                <p className="text-3xl font-bold mt-2">{teacher?.ratings?.average || 0}/5</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
            <div className="mt-4 text-green-200 text-sm">
              {teacher?.ratings?.count || 0} reviews
            </div>
          </div>
        </section>

        {/* Quick Actions & Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
              <span className="mr-2">⚡</span> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {teacher?.permissions?.canTakeAttendance && (
                <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl transition-colors duration-200 font-semibold text-center">
                  📝 Take Attendance
                </button>
              )}
              <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-xl transition-colors duration-200 font-semibold text-center">
                📚 Add Materials
              </button>
              {teacher?.permissions?.canGradeStudents && (
                <button className="bg-red-100 hover:bg-red-200 text-red-800 p-4 rounded-xl transition-colors duration-200 font-semibold text-center">
                  📊 View Grades
                </button>
              )}
              <button className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-xl transition-colors duration-200 font-semibold text-center">
                💬 Messages
              </button>
            </div>
            
            {/* Teacher Details */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-3">Teacher Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Join Date:</span>
                  <span className="font-medium">
                    {teacher?.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${teacher?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {teacher?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Login Count:</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
              <span className="mr-2">🔄</span> Recent Activities
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <span className="text-xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className={`font-semibold ${getActivityColor(activity.type)}`}>
                        {activity.user}
                      </span>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{activity.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 font-semibold py-2 border border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors duration-200">
              View All Activities →
            </button>
          </div>
        </section>

        {/* Upcoming Events & Permissions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">📅</span> Upcoming Events
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-700 p-4 rounded-xl">
                <div className="text-yellow-300 font-bold">Next Week</div>
                <div className="font-semibold">Parent-Teacher Meeting</div>
                <div className="text-blue-200 text-sm">10:00 AM - Auditorium</div>
              </div>
              <div className="bg-blue-700 p-4 rounded-xl">
                <div className="text-yellow-300 font-bold">This Month</div>
                <div className="font-semibold">Monthly Assessment</div>
                <div className="text-blue-200 text-sm">All assigned classes</div>
              </div>
            </div>
          </div>

          {/* Permissions Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
              <span className="mr-2">🔐</span> Your Permissions
            </h3>
            <div className="space-y-3">
              {teacher?.permissions?.canTakeAttendance && (
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Can take attendance</span>
                </div>
              )}
              {teacher?.permissions?.canGradeStudents && (
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Can grade students</span>
                </div>
              )}
              {teacher?.permissions?.canCreateAssignments && (
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Can create assignments</span>
                </div>
              )}
              {teacher?.permissions?.canManageClass && (
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Can manage classes</span>
                </div>
              )}
              {teacher?.permissions?.canViewAllStudents && (
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Can view all students</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;