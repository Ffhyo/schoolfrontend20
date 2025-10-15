import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '../components/ui/carousel';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const reviews = [
  {
    name: 'Priya Sharma',
    text: 'Sunflower Academy has transformed my child\'s learning experience. The teachers are amazing and the environment is nurturing.',
  },
  {
    name: 'Rahul Verma',
    text: 'Great school with modern facilities and a focus on holistic development. Highly recommended!',
  },
  {
    name: 'Aarti Singh',
    text: 'The management is very supportive and the curriculum is well-structured.',
  },
];

const news = [
  {
    title: 'Annual Sports Day Announced',
    date: 'September 30, 2025',
    description: 'Join us for a day of fun and sportsmanship. All students and parents are invited!',
  },
  {
    title: 'New Science Lab Inauguration',
    date: 'October 10, 2025',
    description: 'Our new state-of-the-art science lab will be open for classes from next month.',
  },
];

interface Hero {
  _id: string;
  mainTitle: string;
  subheadline: string;
  heroImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

const Homepage: React.FC = () => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'guest' | 'admin' | 'teacher' | 'student'>('guest');
  const [currentUser, setCurrentUser] = useState<string | undefined>(undefined);

  // Sync with localStorage on component mount
  useEffect(() => {
    const storedRole = localStorage.getItem('role') as 'guest' | 'admin' | 'teacher' | 'student' | null;
    const storedAdmin = localStorage.getItem('currentAdmin');
    const storedTeacher = localStorage.getItem('currentTeacher');
    const storedStudent = localStorage.getItem('currentStudent');
    
    if (storedRole) {
      setRole(storedRole);
      
      // Set current user based on role
      if (storedRole === 'admin' && storedAdmin) {
        try {
          const adminData = JSON.parse(storedAdmin);
          setCurrentUser(adminData.username || 'Admin');
        } catch (error) {
          console.error('Error parsing admin data:', error);
        }
      } else if (storedRole === 'teacher' && storedTeacher) {
        try {
          const teacherData = JSON.parse(storedTeacher);
          setCurrentUser(teacherData.username || 'Teacher');
        } catch (error) {
          console.error('Error parsing teacher data:', error);
        }
      } else if (storedRole === 'student' && storedStudent) {
        try {
          const studentData = JSON.parse(storedStudent);
          setCurrentUser(studentData.username || 'Student');
        } catch (error) {
          console.error('Error parsing student data:', error);
        }
      }
    } else {
      setRole('guest');
      setCurrentUser(undefined);
    }
  }, []);

  // Update the setRole function to also update localStorage and currentUser
  const handleSetRole = (newRole: 'guest' | 'admin' | 'teacher' | 'student') => {
    setRole(newRole);
    if (newRole === 'guest') {
      localStorage.removeItem('role');
      setCurrentUser(undefined);
    } else {
      localStorage.setItem('role', newRole);
    }
  };

  // Update current user function
  const handleSetCurrentUser = (username: string) => {
    setCurrentUser(username);
  };

  // Fetch hero sections from backend
  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/heroes');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch heroes: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Updated: Check the actual response structure from your backend
        if (data.success && data.data) {
          setHeroes(data.data); // If your backend returns { success: true, data: [...] }
        } else if (data.heroes) {
          setHeroes(data.heroes); // If your backend returns { heroes: [...] }
        } else {
          setHeroes([]);
        }
        
      } catch (error) {
        console.error('Error fetching heroes:', error);
        setError('Failed to load hero sections');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroes();
  }, []);

  // Function to get full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return '';
    // If imagePath already includes full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, construct full URL from backend
    return `http://localhost:8000${imagePath}`;
  };

  // Default hero content if no heroes are available
  const defaultHeroes: Hero[] = [
    {
      _id: 'default-1',
      mainTitle: 'Welcome to Sunflower Academy',
      subheadline: 'Nurturing young minds for a brighter future with excellence in education since 1990.',
      heroImage: '/default-hero.jpg'
    }
  ];

  const displayHeroes = heroes.length > 0 ? heroes : defaultHeroes;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 to-blue-100">
      {/* Navbar with all props - FIXED: Now passes setCurrentUser */}
      <Navbar 
        role={role} 
        setRole={handleSetRole} 
        currentUser={currentUser}
        setCurrentUser={handleSetCurrentUser}
      />

      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden bg-white">
        <Carousel className="w-full h-screen relative">
          <CarouselContent className="h-full">
            {displayHeroes.map((hero) => (
              <CarouselItem key={hero._id} className="relative w-full h-screen">
                <div className="absolute inset-0 flex flex-col lg:flex-row">
                  {/* Desktop Content */}
                  <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-blue-50 to-slate-50">
                    <div className="relative z-20 flex flex-col justify-center h-full px-12 lg:px-16 text-slate-800">
                      <div className="space-y-6 max-w-lg">
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight animate-slide-up text-slate-900">
                          {hero.mainTitle}
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-600 leading-relaxed animate-slide-up delay-200">
                          {hero.subheadline}
                        </p>
                        
                        {/* Show different buttons based on login status */}
                        {role === 'guest' ? (
                          <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-slide-up delay-400">
                            <Button className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-blue-600/25">
                              {hero.ctaText || 'Start Free Trial'}
                            </Button>
                            <Button
                              variant="outline"
                              className="border-blue-600 text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-600/5 transition-all duration-300"
                            >
                              Schedule Demo
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-slide-up delay-400">
                            <Button 
                              className="bg-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-green-600/25"
                              onClick={() => window.location.href = getDashboardLink()}
                            >
                              Go to Dashboard
                            </Button>
                            <Button
                              variant="outline"
                              className="border-blue-600 text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-600/5 transition-all duration-300"
                            >
                              Explore Courses
                            </Button>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-6 pt-6 animate-slide-up delay-600">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">99.9%</div>
                            <div className="text-sm text-slate-500">Uptime</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">10K+</div>
                            <div className="text-sm text-slate-500">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">24/7</div>
                            <div className="text-sm text-slate-500">Support</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Image */}
                  <div className="absolute inset-0 lg:relative lg:w-1/2 z-10">
                    {hero.heroImage ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${getImageUrl(hero.heroImage)})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/50 to-blue-900/70 lg:bg-none"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <div className="text-white text-center p-8">
                          <h2 className="text-3xl font-bold mb-4">Sunflower Academy</h2>
                          <p className="text-xl">Excellence in Education</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Content */}
                  <div className="absolute inset-0 z-20 flex flex-col justify-center lg:hidden">
                    <div className="px-6 text-white text-center">
                      <div className="space-y-6 max-w-lg mx-auto">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                          {hero.mainTitle}
                        </h1>
                        <p className="text-base md:text-lg text-blue-100 leading-relaxed">
                          {hero.subheadline}
                        </p>
                        {role === 'guest' ? (
                          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                            <Button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:shadow-lg">
                              {hero.ctaText || 'Start Free Trial'}
                            </Button>
                            <Button
                              variant="outline"
                              className="border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-all duration-300"
                            >
                              Schedule Demo
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                            <Button 
                              className="bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-all duration-300 hover:shadow-lg"
                              onClick={() => window.location.href = getDashboardLink()}
                            >
                              Go to Dashboard
                            </Button>
                            <Button
                              variant="outline"
                              className="border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-all duration-300"
                            >
                              Explore Courses
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 h-10 w-10 lg:h-12 lg:w-12 rounded-lg transition-all duration-300 shadow-md" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 h-10 w-10 lg:h-12 lg:w-12 rounded-lg transition-all duration-300 shadow-md" />
        </Carousel>
      </section>

      {/* Reviews Section */}
      <section className="max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">What Parents Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-700 italic mb-4">"{review.text}"</p>
              <p className="text-yellow-700 font-bold">- {review.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* News Section */}
      <section className="max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {news.map((item, idx) => (
            <div key={idx} className="bg-blue-50 rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-yellow-700 mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-2">{item.date}</p>
              <p className="text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-yellow-700 mb-4 text-center">About Sunflower Academy</h2>
        <p className="text-lg text-gray-700 text-center">
          Sunflower Academy is dedicated to providing a nurturing environment where every child can flourish.
          Our curriculum blends academics, arts, and sports to foster well-rounded development. With modern
          facilities and passionate educators, we prepare students for success in a changing world.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-blue-700 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="font-bold text-lg mb-2">Contact Us</h3>
            <p>Email: info@sunfloweracademy.com</p>
            <p>Phone: +1 234 567 8901</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Location</h3>
            <p>123 Sunflower Lane, City Center, YourCity, Country</p>
          </div>
        </div>
        <div className="text-center text-xs mt-6">&copy; 2025 Sunflower Academy. All rights reserved.</div>
      </footer>
    </div>
  );

  // Helper function to get dashboard link
  function getDashboardLink(): string {
    const storedAdmin = localStorage.getItem('currentAdmin');
    const storedTeacher = localStorage.getItem('currentTeacher');
    const storedStudent = localStorage.getItem('currentStudent');
    
    if (role === 'admin' && storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        const adminId = adminData.id || adminData._id;
        return adminId ? `/admin/${adminId}/dashboard` : '/admin/dashboard';
      } catch (error) {
        return '/admin/dashboard';
      }
    }
    if (role === 'teacher' && storedTeacher) {
      try {
        const teacherData = JSON.parse(storedTeacher);
        const teacherId = teacherData.id || teacherData._id;
        return teacherId ? `/teacher/${teacherId}/dashboard` : '/teacher/dashboard';
      } catch (error) {
        return '/teacher/dashboard';
      }
    }
    if (role === 'student' && storedStudent) {
      try {
        const studentData = JSON.parse(storedStudent);
        const studentId = studentData.id || studentData._id;
        return studentId ? `/student/${studentId}/dashboard` : '/student/dashboard';
      } catch (error) {
        return '/student/dashboard';
      }
    }
    
    // Fallback routes
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'teacher') return '/teacher/dashboard';
    if (role === 'student') return '/student/dashboard';
    return '/';
  }
};

export default Homepage;