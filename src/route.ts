import AdminLayout from './pages/admin/layout';
import AdminDashboard from './pages/admin/adminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import TeacherLayout from './pages/teacher/layout';
import TeacherDashboard from './pages/teacher/teacherDashboard';
import StudentLayout from './pages/student/layout';
import StudentDashboard from './pages/student/studentDashboard';
import StaffLayout from './pages/staff/layout';
import StaffDashboard from './pages/staff/staffDashboard';
import Homepage from './pages/Homepage';
import About from './pages/about';
import Contact from './pages/contact';
import NotFound from './pages/notfound';
import TeacherProfile from './pages/teacher/profile';
import MyClasses from './pages/teacher/classes';
import StudentsRelated from './pages/teacher/students';
 
//recently
 
import StudentProfiles from './pages/admin/StudentProfiles';
import StudentAttendance from './pages/admin/StudentAttendance';
import StudentGrades from './pages/admin/StudentGrades';
import StudentFees from './pages/admin/StudentFees';
import StudentReports from './pages/admin/StudentReports';
import Report from './pages/teacher/report';
import Assignment from './pages/student/Assigment';


export const routes = [
  { 
    path: '/', 
    element: Homepage 
  },
  { 
    path: '/about', 
    element: About 
  },
  { 
    path: '/contact', 
    element: Contact 
  },
  {
    path: '/admin/:adminId',
    layout: AdminLayout,
    rolesAllowed: ['admin'],
    children: [
      { 
        path: 'dashboard', 
        element: AdminDashboard 
      },
    { 
        path: 'students', 
        element: AdminStudents 
      },
     
      { 
        path: 'teachers', 
        element: AdminTeachers 
      },
      { 
        path: 'courses', 
        element: AdminCourses 
      },
      { 
        path: 'settings', 
        element: AdminSettings 
      } ,
        { 
        path: 'analytics',  // Add this route
        element: AdminAnalytics 
      },
       { 
        path: 'students', 
        element: AdminStudents 
      },
      { 
        path: 'students/profiles', 
        element: StudentProfiles 
      },
      { 
        path: 'students/attendance', 
        element: StudentAttendance 
      },
      { 
        path: 'students/grades', 
        element: StudentGrades 
      },
      { 
        path: 'students/fees', 
        element: StudentFees 
      },
      { 
        path: 'students/reports', 
        element: StudentReports 
      },
    ],
  },
  {
    path: '/teacher/:teacherId',
    layout: TeacherLayout,
    rolesAllowed: ['teacher'],
    children: [
      
      {
        path: 'dashboard',
        element: TeacherDashboard ,
      },
      {
        path: 'profile',
        element: TeacherProfile ,
      },
      {
        path: 'classes',
        element: MyClasses ,
      },
      {
        path: 'students',
        element: StudentsRelated ,
      },
      {
        path:'report',
        element:Report,
      }
      
    ],
  },
  {
    path: '/student/:studentId',
    layout: StudentLayout,
    rolesAllowed: ['student'],
    children: [
      { 
        path: 'dashboard', 
        element: StudentDashboard 
      },
      {
        path:'Assignment',
        element:Assignment,
      }
    ],
  },
  {
    path: '/staff/:staffId',
    layout: StaffLayout,
    rolesAllowed: ['staff'],
    children: [
      { 
        path: 'dashboard', 
        element: StaffDashboard 
      }
    ],
  },
  { 
    path: '*', 
    element: NotFound 
  },
];