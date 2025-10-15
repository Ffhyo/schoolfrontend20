import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  subjects: string[];
  gradeLevels: string[];
  experience: number;
  department: string;
  qualification: string;
  specialization: string;
  employmentType: string;
  permissions: {
    canGradeStudents: boolean;
    canTakeAttendance: boolean;
    canCreateAssignments: boolean;
    canViewAllStudents: boolean;
    canManageClass: boolean;
  };
  assignedClasses: any[]; // This contains the classes data
  schedule: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
}

interface ClassType {
  _id: string;
  name: string;
  subject: string;
  gradeLevel: string;
  students: string[];
  schedule: string[];
}

export default function MyClasses() {
  const { teacherId } = useParams<{ teacherId: string }>();
  console.log('teacherId from params:', teacherId);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeacherAndClasses();
  }, [teacherId]);

  const fetchTeacherAndClasses = async () => {
    try {
      setLoading(true);
      
      // Fetch teacher data
      const teacherResponse = await fetch(`http://localhost:8000/api/teachers/${teacherId}`);
      if (!teacherResponse.ok) throw new Error('Failed to fetch teacher data');
      const teacherData = await teacherResponse.json();
      setTeacher(teacherData.teacher);
      console.log('Fetched teacher data:', teacherData);

      // The classes data is in teacherData.teacher.assignedClasses
      // If assignedClasses is empty, we can show a message
      setClasses(teacherData.teacher.assignedClasses || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Function to get schedule for today
  const getTodaysSchedule = () => {
    if (!teacher) return [];
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const todaySchedule = teacher.schedule[days[today] as keyof typeof teacher.schedule];
    
    return todaySchedule || [];
  };

  // Mock classes data for demonstration (only used if assignedClasses is empty)
  const mockClasses: ClassType[] = [
    {
      _id: '1',
      name: 'Grade 9 Science A',
      subject: 'Science',
      gradeLevel: 'Grade 9',
      students: ['Student 1', 'Student 2', 'Student 3'],
      schedule: ['Mon 9:00-10:00', 'Wed 9:00-10:00']
    },
    {
      _id: '2',
      name: 'Grade 10 Physics',
      subject: 'Physics',
      gradeLevel: 'Grade 10',
      students: ['Student 4', 'Student 5'],
      schedule: ['Tue 11:00-12:00', 'Thu 11:00-12:00']
    }
  ];

  // Use actual classes from teacher data, fallback to mock data if empty
  const displayClasses = classes.length > 0 ? classes : mockClasses;

  if (loading) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <div className="text-red-600">{error}</div>
        <button 
          onClick={fetchTeacherAndClasses}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <div className="text-red-600">Teacher not found</div>
      </div>
    );
  }

  const { permissions } = teacher;
  const todaysSchedule = getTodaysSchedule();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Teacher Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome, {teacher.firstName} {teacher.lastName}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span>📧 {teacher.email}</span>
              <span>📞 {teacher.phone}</span>
              <span>🎓 {teacher.qualification}</span>
              <span>⏳ {teacher.experience} years experience</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              {teacher.employmentType} • {teacher.department}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permissions Display */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Permissions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {permissions.canManageClass && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-green-600 font-semibold">Manage Classes</div>
                  <div className="text-green-500 text-sm">Create and manage classes</div>
                </div>
              )}
              {permissions.canGradeStudents && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-purple-600 font-semibold">Grade Students</div>
                  <div className="text-purple-500 text-sm">Evaluate student work</div>
                </div>
              )}
              {permissions.canTakeAttendance && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-yellow-600 font-semibold">Take Attendance</div>
                  <div className="text-yellow-500 text-sm">Mark student attendance</div>
                </div>
              )}
              {permissions.canCreateAssignments && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-blue-600 font-semibold">Create Assignments</div>
                  <div className="text-blue-500 text-sm">Create homework & projects</div>
                </div>
              )}
              {permissions.canViewAllStudents && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-600 font-semibold">View All Students</div>
                  <div className="text-red-500 text-sm">Access all student records</div>
                </div>
              )}
            </div>
          </div>

          {/* Classes Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                My Classes {classes.length === 0 && '(Demo)'}
              </h2>
              {permissions.canManageClass && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  + Create New Class
                </button>
              )}
            </div>

            {displayClasses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg mb-2">No classes assigned yet</p>
                {permissions.canManageClass && (
                  <p className="text-sm">Create your first class to get started</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayClasses.map((classItem) => (
                  <div key={classItem._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">{classItem.name}</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-600 flex items-center">
                        <span className="mr-2">📖</span>
                        Subject: {classItem.subject}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <span className="mr-2">🎓</span>
                        Grade: {classItem.gradeLevel}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <span className="mr-2">👥</span>
                        Students: {classItem.students?.length || 0}
                      </p>
                      {classItem.schedule && (
                        <p className="text-gray-600 flex items-center">
                          <span className="mr-2">🕒</span>
                          Schedule: {classItem.schedule.join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {permissions.canTakeAttendance && (
                        <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors">
                          📊 Attendance
                        </button>
                      )}
                      {permissions.canGradeStudents && (
                        <button className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors">
                          📝 Grade
                        </button>
                      )}
                      {permissions.canCreateAssignments && (
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                          📋 Assignments
                        </button>
                      )}
                      {permissions.canManageClass && (
                        <button className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors">
                          ⚙️ Manage
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Actions & Today's Schedule */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {permissions.canTakeAttendance && (
                <button className="w-full bg-green-50 border border-green-200 rounded-lg p-3 text-left hover:bg-green-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    <div>
                      <div className="font-semibold text-green-700">Take Attendance</div>
                      <div className="text-green-600 text-sm">Mark today's attendance</div>
                    </div>
                  </div>
                </button>
              )}
              
              {permissions.canCreateAssignments && (
                <button className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-left hover:bg-blue-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📝</span>
                    <div>
                      <div className="font-semibold text-blue-700">Create Assignment</div>
                      <div className="text-blue-600 text-sm">New homework or project</div>
                    </div>
                  </div>
                </button>
              )}
              
              {permissions.canGradeStudents && (
                <button className="w-full bg-purple-50 border border-purple-200 rounded-lg p-3 text-left hover:bg-purple-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎯</span>
                    <div>
                      <div className="font-semibold text-purple-700">Grade Work</div>
                      <div className="text-purple-600 text-sm">Evaluate student submissions</div>
                    </div>
                  </div>
                </button>
              )}
              
              {permissions.canViewAllStudents && (
                <button className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-left hover:bg-red-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👥</span>
                    <div>
                      <div className="font-semibold text-red-700">View Students</div>
                      <div className="text-red-600 text-sm">All school students</div>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Schedule</h2>
            {todaysSchedule.length > 0 ? (
              <div className="space-y-2">
                {todaysSchedule.map((timeSlot, index) => (
                  <div key={index} className="flex items-center p-2 bg-blue-50 rounded">
                    <span className="text-blue-600 mr-2">🕒</span>
                    <span className="text-blue-700">{timeSlot}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p>No classes scheduled for today</p>
              </div>
            )}
          </div>

          {/* Teacher Subjects */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Subjects & Grades</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Primary Subject:</h3>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block">
                  {teacher.subject}
                </div>
              </div>
              {teacher.subjects && teacher.subjects.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">All Subjects:</h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map((subject, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {teacher.gradeLevels && teacher.gradeLevels.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Grade Levels:</h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.gradeLevels.map((grade, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                        {grade}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}