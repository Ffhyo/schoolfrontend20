import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from './ui/alert-dialog';
const API_BASE_URL='https://schoolbackend-un9x.onrender.com'

interface NavbarProps {
  role?: 'guest' | 'admin' | 'teacher' | 'student';
  setRole?: (role: 'guest' | 'admin' | 'teacher' | 'student') => void;
  currentUser?: string;
  setCurrentUser?: (username: string) => void;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

type LoginStep = 'initial' | 'loginToadmin' | 'loginToteacher' | 'loginTostudent';

const Navbar: React.FC<NavbarProps> = ({ 
  role = 'guest', 
  setRole, 
  currentUser, 
  setCurrentUser,
  isMobile = false,
  onLinkClick 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loginStep, setLoginStep] = useState<LoginStep>('initial');
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // FIXED: Show login options for guests AND also show switch account option for logged-in users
  const showLoginOptions = location.pathname === '/' && setRole;

  // Sync role with localStorage on component mount
  useEffect(() => {
    const storedRole = localStorage.getItem('role') as NavbarProps['role'];
    if (storedRole && setRole && storedRole !== role) {
      setRole(storedRole);
    }
  }, [setRole, role]);

  // Reset states when role changes to guest
  useEffect(() => {
    if (role === 'guest') {
      setLoading(false);
      setLoginStep('initial');
      setLoginForm({ username: '', password: '' });
      setError('');
    }
  }, [role]);

  // Safe parsing function with error handling
  const safeParse = (item: string | null) => {
    if (!item || item === 'undefined') return null;
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  };

  // Helper function to validate stored user data
  const validateStoredUser = (data: any) => {
    if (!data || typeof data !== 'object') return null;
    
    // Check for at least one identifying property
    if (!data.username && !data.id && !data._id) return null;
    
    return {
      id: data.id || data._id || null,
      username: data.username || null
    };
  };

  const getDashboardLink = () => {
    // Get user data from localStorage with error handling
    const storedAdmin = validateStoredUser(safeParse(localStorage.getItem('currentAdmin')));
    const storedTeacher = validateStoredUser(safeParse(localStorage.getItem('currentTeacher')));
    const storedStudent = validateStoredUser(safeParse(localStorage.getItem('currentStudent')));
    
    if (role === 'admin' && storedAdmin) {
      const adminId = storedAdmin.id;
      return adminId ? `/admin/${adminId}/dashboard` : '/admin/dashboard';
    }
    if (role === 'teacher' && storedTeacher) {
      const teacherId = storedTeacher.id;
      return teacherId ? `/teacher/${teacherId}/dashboard` : '/teacher/dashboard';
    }
    if (role === 'student' && storedStudent) {
      const studentId = storedStudent.id;
      return studentId ? `/student/${studentId}/dashboard` : '/student/dashboard';
    }
    
    // Fallback routes
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'teacher') return '/teacher/dashboard';
    if (role === 'student') return '/student/dashboard';
    return '/';
  };

  const handleLoginClick = (step: LoginStep) => {
    setLoginStep(step);
    setError('');
    setLoading(false);
    onLinkClick?.();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Client-side validation
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    if (loginForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    try {
      let response;
      let data;

      switch (loginStep) {
        case 'loginToadmin':
          console.log('Sending admin login request for:', loginForm.username);
          
          response = await fetch(`${API_BASE_URL}/api/admins/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(loginForm)
          });
          
          console.log('Response status:', response.status);
          data = await response.json();
          console.log('Full login response:', data);
          
          if (response.ok && data.message === "success") {
            console.log('User object:', data.user);
            console.log('User ID:', data.user?.id);
            
            // Ensure we have valid data before storing
            const adminData = data.user || { username: loginForm.username };
            const storageData = {
              id: adminData.id || adminData._id,
              username: adminData.username || loginForm.username,
            };

            // Store with validation
            try {
              localStorage.setItem('currentAdmin', JSON.stringify(storageData));
              localStorage.setItem('role', 'admin');
            } catch (storageError) {
              console.error('Failed to store user data:', storageError);
            }
            
            setRole?.('admin');
            setCurrentUser?.(storageData.username);
            
            // Notify App.tsx about role change
            window.dispatchEvent(new Event('roleChanged'));
            
            // Reset login states
            setLoginStep('initial');
            setLoginForm({ username: '', password: '' });
            setError('');
            setLoading(false);
            
            // Redirect to admin-specific dashboard with ID
            if (storageData.id) {
              navigate(`/admin/${storageData.id}/dashboard`);
            } else {
              console.error('No user ID found in response:', data.user);
              navigate('/admin/dashboard');
            }
          } else {
            const errorMessage = data.error || "Invalid credentials";
            setError(errorMessage);
            setLoading(false);
            return;
          }
          break;
          
        case 'loginToteacher':
          response = await fetch(`${API_BASE_URL}/api/teachers/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(loginForm)
          });
          
          data = await response.json();
          if (data.message === "success" && response.ok) {
            const teacherData = data.user || { username: loginForm.username };
            const storageData = {
              id: teacherData.id || teacherData._id,
              username: teacherData.username || loginForm.username,
            };

            try {
              localStorage.setItem('currentTeacher', JSON.stringify(storageData));
              localStorage.setItem('role', 'teacher');
            } catch (storageError) {
              console.error('Failed to store user data:', storageError);
            }

            setRole?.('teacher');
            setCurrentUser?.(storageData.username);
            
            // Notify App.tsx about role change
            window.dispatchEvent(new Event('roleChanged'));
            
            // Reset login states
            setLoginStep('initial');
            setLoginForm({ username: '', password: '' });
            setError('');
            setLoading(false);
            
            if (storageData.id) {
              navigate(`/teacher/${storageData.id}/dashboard`);
            } else {
              navigate('/teacher/dashboard');
            }
          } else {
            const errorMessage = data.error || "Invalid credentials";
            setError(errorMessage);
            setLoading(false);
            return;
          }
          break;
          
        case 'loginTostudent':
          // For student login, use mock or implement similar to above
 
            response = await fetch(`${API_BASE_URL}/api/students`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(loginForm)
          });
           data = await response.json();
           if(data.message ==='success' && response.ok){
            const studentData =data.user || {username:loginForm.username};
             const storageData = {
              id: studentData.id || studentData._id,
              username: studentData.username || loginForm.username,
            }; 
          
              


          try {
            localStorage.setItem('role', 'student');
            localStorage.setItem('currentStudent', JSON.stringify(storageData));
          } catch (storageError) {
            console.error('Failed to store user data:', storageError);
          }

          setRole?.('student');
          setCurrentUser?.(storageData.username);
          
          // Notify App.tsx about role change
          window.dispatchEvent(new Event('roleChanged'));
          
          // Reset login states
          setLoginStep('initial');
          setLoginForm({ username: '', password: '' });
          setError('');
          setLoading(false);
          
          navigate('/student/dashboard');
        }else {
            const errorMessage = data.error || "Invalid credentials";
            setError(errorMessage);
            setLoading(false);
            return;
          }
          break;
          
        default:
          setLoading(false);
          break;
      }
      
      onLinkClick?.();
      
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleDialogClose = () => {
    setLoginStep('initial');
    setLoginForm({ username: '', password: '' });
    setError('');
    setLoading(false);
  };

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
    onLinkClick?.();
  };

  const handleLogout = () => {
    console.log('Logging out - current state:', { role, loading, loginStep });
    
    // Reset all states first
    setRole?.('guest');
    setCurrentUser?.('');
    setLoginStep('initial');
    setLoginForm({ username: '', password: '' });
    setError('');
    setLoading(false);
    
    // Clear all possible storage keys safely
    const keysToRemove = [
      'role', 
      'currentAdmin', 
      'currentTeacher', 
      'currentStudent',
      'token',
      'adminToken',
      'teacherToken',
      'studentToken'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove ${key}:`, error);
      }
    });
    
    // Clear session storage as well
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
    
    // Notify App.tsx about role change
    window.dispatchEvent(new Event('roleChanged'));
    
    setMobileMenuOpen(false);
    onLinkClick?.();
    navigate('/');
    
    console.log('Logout completed - state should be reset');
  };

  // Debug logging
  console.log('Navbar render state:', { role, loading, loginStep, mobileMenuOpen });

  // Mobile Menu Component
  if (isMobile) {
    return (
      <div className="space-y-4">
        {role !== 'guest' && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="font-semibold text-blue-900">Welcome back{currentUser ? `, ${currentUser}` : ''}!</p>
            <p className="text-sm text-blue-700 capitalize">{role} Dashboard</p>
          </div>
        )}

        <div className="space-y-2">
          <Link 
            to="/" 
            className="block w-full text-left p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            onClick={handleNavLinkClick}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="block w-full text-left p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            onClick={handleNavLinkClick}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="block w-full text-left p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            onClick={handleNavLinkClick}
          >
            Contact
          </Link>
        </div>

        {role !== 'guest' && (
          <div className="space-y-2">
            <Link 
              to={getDashboardLink()} 
              className="block w-full text-center p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold"
              onClick={handleNavLinkClick}
            >
              Go to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-center p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold"
              disabled={loading}
            >
              Logout
            </button>
          </div>
        )}

        {/* FIXED: Always show login options for switching accounts */}
        {showLoginOptions && (
          <AlertDialog onOpenChange={(open) => !open && handleDialogClose()}>
            <AlertDialogTrigger asChild>
              <button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold"
                disabled={loading}
              >
                {role === 'guest' ? 'Get Started' : 'Switch Account'}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gradient-to-br from-slate-50 to-blue-50 p-0 rounded-xl shadow-2xl border border-blue-200/50 overflow-hidden z-50 max-w-md mx-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
                <AlertDialogHeader>
                  <div className='flex justify-between items-center'>
                    <AlertDialogTitle className="text-xl font-bold">
                      {loginStep === 'initial' 
                        ? (role === 'guest' ? 'Welcome to Sunflower Academy!' : 'Switch Account')
                        : `Login as ${loginStep.replace('loginTo', '')}`}
                    </AlertDialogTitle>
                    <AlertDialogCancel 
                      className="text-white hover:bg-white/20 p-1 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                      onClick={handleDialogClose}
                      disabled={loading}
                    >
                      ✕
                    </AlertDialogCancel>
                  </div>
                  <AlertDialogDescription className="text-blue-100 mt-2">
                    {loginStep === 'initial' 
                      ? (role === 'guest' 
                          ? 'Please sign up or log in to access the dashboard and explore more features.'
                          : 'Login with a different account type.')
                      : 'Please enter your credentials to login.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {loginStep === 'initial' && (
                <div className="flex flex-col gap-3 p-6">
                  <button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleLoginClick('loginToadmin')}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Login as Admin'}
                  </button>
                  <button
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleLoginClick('loginToteacher')}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Login as Teacher'}
                  </button>
                  <button
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleLoginClick('loginTostudent')}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Login as Student'}
                  </button>
                </div>
              )}

              {loginStep !== 'initial' && (
                <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={loginForm.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter your username"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={loginForm.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setLoginStep('initial')}
                      className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-blue-50/50 p-4 text-center border-t border-blue-200/50">
                <p className="text-sm text-blue-600">
                  New to Sunflower Academy?{' '}
                  <button 
                    type="button"
                    className="text-blue-700 font-semibold hover:underline"
                    onClick={handleDialogClose}
                    disabled={loading}
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    );
  }

  // Desktop Navigation
  return (
    <nav className="z-50 bg-gradient-to-r from-blue-600 to-purple-700 text-white h-20 flex items-center justify-between relative px-4 sm:px-6 lg:px-8 shadow-lg shadow-blue-500/20">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="font-bold flex items-center">
          <img src="/Logo.svg" alt="Sunflower Academy Logo" className="h-12 w-12 sm:h-16 sm:w-16" />
          <span className="ml-2 text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Sunflower Academy
          </span>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          disabled={loading}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden lg:flex items-center justify-end flex-1">
        {/* User Info & Dashboard Link */}
        <div className="font-bold text-lg mr-6 xl:mr-8 flex items-center gap-4">
          {role !== 'guest' && (
            <>
              <div className="text-sm text-blue-100">
                Welcome, {currentUser || role}
              </div>
              <Link 
                to={getDashboardLink()} 
                className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300 border border-red-300/20 text-red-100 hover:text-white"
                disabled={loading}
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <ul className="flex gap-2 font-semibold text-sm xl:text-base items-center">
          <li>
            <Link 
              to="/" 
              className="hover:bg-white/20 cursor-pointer rounded-lg px-3 py-2 xl:px-4 xl:py-2 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/30"
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className="hover:bg-white/20 cursor-pointer rounded-lg px-3 py-2 xl:px-4 xl:py-2 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/30"
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/contact" 
              className="hover:bg-white/20 cursor-pointer rounded-lg px-3 py-2 xl:px-4 xl:py-2 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/30"
            >
              Contact
            </Link>
          </li>

          {/* FIXED: Always show login options for switching accounts */}
          {showLoginOptions && (
            <li>
              <AlertDialog onOpenChange={(open) => !open && handleDialogClose()}>
                <AlertDialogTrigger asChild>
                  <button 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg px-4 py-2 xl:px-6 xl:py-2 hover:from-blue-600 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 font-semibold border border-white/20 text-sm xl:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {role === 'guest' ? 'Get Started' : 'Switch Account'}
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-gradient-to-br from-slate-50 to-blue-50 p-0 rounded-xl shadow-2xl border border-blue-200/50 overflow-hidden z-50 max-w-md">
                  {/* Dialog Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
                    <AlertDialogHeader>
                      <div className='flex justify-between items-center'>
                        <AlertDialogTitle className="text-xl font-bold">
                          {loginStep === 'initial' 
                            ? (role === 'guest' ? 'Welcome to Sunflower Academy!' : 'Switch Account')
                            : `Login as ${loginStep.replace('loginTo', '')}`}
                        </AlertDialogTitle>
                        <AlertDialogCancel 
                          className="text-white hover:bg-white/20 p-1 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          onClick={handleDialogClose}
                          disabled={loading}
                        >
                          ✕
                        </AlertDialogCancel>
                      </div>
                      <AlertDialogDescription className="text-blue-100 mt-2">
                        {loginStep === 'initial' 
                          ? (role === 'guest' 
                              ? 'Please sign up or log in to access the dashboard and explore more features.'
                              : 'Login with a different account type.')
                          : 'Please enter your credentials to login.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>

                  {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Initial Role Selection */}
                  {loginStep === 'initial' && (
                    <div className="flex flex-col gap-3 p-6">
                      <button
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleLoginClick('loginToadmin')}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Login as Admin'}
                      </button>
                      <button
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleLoginClick('loginToteacher')}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Login as Teacher'}
                      </button>
                      <button
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleLoginClick('loginTostudent')}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Login as Student'}
                      </button>
                    </div>
                  )}

                  {/* Login Forms */}
                  {loginStep !== 'initial' && (
                    <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={loginForm.username}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter your username"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={loginForm.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          placeholder="Enter your password"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setLoginStep('initial')}
                          className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : 'Login'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Footer */}
                  <div className="bg-blue-50/50 p-4 text-center border-t border-blue-200/50">
                    <p className="text-sm text-blue-600">
                      New to Sunflower Academy?{' '}
                      <button 
                        type="button"
                        className="text-blue-700 font-semibold hover:underline"
                        onClick={handleDialogClose}
                        disabled={loading}
                      >
                        Create an account
                      </button>
                    </p>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          )}
        </ul>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg border-t border-white/20">
          <div className="p-6">
            <Navbar 
              role={role}
              setRole={setRole}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              isMobile={true}
              onLinkClick={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;