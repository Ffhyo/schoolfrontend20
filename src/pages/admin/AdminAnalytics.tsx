import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  
  Users, 
  
  DollarSign, 
  Clock,
 
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    studentGrowth: number;
    teacherGrowth: number;
    attendanceRate: number;
    averageGPA: number;
  };
  studentStats: {
    byGrade: { grade: string; count: number }[];
    byHouse: { house: string; count: number; color: string }[];
    attendanceTrend: { month: string; rate: number }[];
  };
  revenueData: {
    monthly: { month: string; revenue: number }[];
    bySource: { source: string; amount: number; percentage: number }[];
  };
  performanceMetrics: {
    subjectPerformance: { subject: string; averageScore: number }[];
    teacherPerformance: { teacher: string; rating: number; students: number }[];
  };
  recentActivity: {
    action: string;
    user: string;
    timestamp: string;
    type: 'success' | 'warning' | 'info';
  }[];
}

const AdminAnalytics: React.FC = () => {
  const { adminId } = useParams();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        overview: {
          totalRevenue: 1250000,
          revenueGrowth: 15.2,
          studentGrowth: 8.7,
          teacherGrowth: 3.2,
          attendanceRate: 94.5,
          averageGPA: 3.8
        },
        studentStats: {
          byGrade: [
            { grade: 'Grade 9', count: 320 },
            { grade: 'Grade 10', count: 285 },
            { grade: 'Grade 11', count: 260 },
            { grade: 'Grade 12', count: 225 }
          ],
          byHouse: [
            { house: 'Green House', count: 280, color: '#10B981' },
            { house: 'Red House', count: 265, color: '#EF4444' },
            { house: 'Blue House', count: 275, color: '#3B82F6' },
            { house: 'Yellow House', count: 270, color: '#F59E0B' }
          ],
          attendanceTrend: [
            { month: 'Jan', rate: 92.1 },
            { month: 'Feb', rate: 93.5 },
            { month: 'Mar', rate: 94.2 },
            { month: 'Apr', rate: 95.1 },
            { month: 'May', rate: 94.8 },
            { month: 'Jun', rate: 93.9 }
          ]
        },
        revenueData: {
          monthly: [
            { month: 'Jan', revenue: 98000 },
            { month: 'Feb', revenue: 102000 },
            { month: 'Mar', revenue: 110000 },
            { month: 'Apr', revenue: 115000 },
            { month: 'May', revenue: 118000 },
            { month: 'Jun', revenue: 125000 }
          ],
          bySource: [
            { source: 'Tuition Fees', amount: 850000, percentage: 68 },
            { source: 'Sports Events', amount: 150000, percentage: 12 },
            { source: 'Donations', amount: 120000, percentage: 9.6 },
            { source: 'Other', amount: 130000, percentage: 10.4 }
          ]
        },
        performanceMetrics: {
          subjectPerformance: [
            { subject: 'Mathematics', averageScore: 85.2 },
            { subject: 'Science', averageScore: 82.7 },
            { subject: 'English', averageScore: 78.9 },
            { subject: 'History', averageScore: 81.4 },
            { subject: 'Arts', averageScore: 88.1 }
          ],
          teacherPerformance: [
            { teacher: 'Dr. Sarah Chen', rating: 4.8, students: 45 },
            { teacher: 'Mr. James Wilson', rating: 4.6, students: 38 },
            { teacher: 'Ms. Priya Sharma', rating: 4.7, students: 42 },
            { teacher: 'Dr. Michael Brown', rating: 4.5, students: 36 }
          ]
        },
        recentActivity: [
          { action: 'New student enrollment', user: 'John Doe', timestamp: '2 hours ago', type: 'success' },
          { action: 'Fee payment received', user: 'Smith Family', timestamp: '4 hours ago', type: 'success' },
          { action: 'Teacher attendance alert', user: 'Mr. James Wilson', timestamp: '1 day ago', type: 'warning' },
          { action: 'System backup completed', user: 'System', timestamp: '1 day ago', type: 'info' }
        ]
      });
      setLoading(false);
    }, 1500);
  }, [adminId, timeRange]);

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? '↗' : '↘';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">TOTAL REVENUE</h3>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${(analyticsData!.overview.totalRevenue / 1000000).toFixed(2)}M
              </p>
              <p className={`text-sm ${getGrowthColor(analyticsData!.overview.revenueGrowth)}`}>
                {getGrowthIcon(analyticsData!.overview.revenueGrowth)} {analyticsData!.overview.revenueGrowth}% from last period
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">STUDENT GROWTH</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">+{analyticsData!.overview.studentGrowth}%</p>
              <p className="text-sm text-gray-600">New enrollments this period</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">ATTENDANCE RATE</h3>
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData!.overview.attendanceRate}%</p>
              <p className="text-sm text-gray-600">Overall student attendance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Distribution by Grade */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Student Distribution by Grade</h3>
          <div className="space-y-3">
            {analyticsData!.studentStats.byGrade.map((grade, ) => (
              <div key={grade.grade} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{grade.grade}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(grade.count / Math.max(...analyticsData!.studentStats.byGrade.map(g => g.count))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-8">{grade.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* House Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">House Distribution</h3>
          <div className="space-y-3">
            {analyticsData!.studentStats.byHouse.map((house,  ) => (
              <div key={house.house} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: house.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{house.house}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(house.count / Math.max(...analyticsData!.studentStats.byHouse.map(h => h.count))) * 100}%`,
                        backgroundColor: house.color
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-8">{house.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Sources</h3>
          <div className="space-y-4">
            {analyticsData!.revenueData.bySource.map((source,   ) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">{source.source}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-20 text-right">
                    ${(source.amount / 1000).toFixed(0)}K
                  </span>
                  <span className="text-sm text-gray-500 w-12">{source.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Subject Performance</h3>
          <div className="space-y-3">
            {analyticsData!.performanceMetrics.subjectPerformance.map((subject, ) => (
              <div key={subject.subject} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${subject.averageScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-12">{subject.averageScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analyticsData!.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-600">By {activity.user}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Teachers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsData!.performanceMetrics.teacherPerformance.map((teacher,  ) => (
            <div key={teacher.teacher} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{teacher.teacher}</p>
                <p className="text-sm text-gray-600">{teacher.students} students</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-yellow-600">{teacher.rating}</span>
                  <span className="text-sm text-gray-500">/5.0</span>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      {i < Math.floor(teacher.rating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;