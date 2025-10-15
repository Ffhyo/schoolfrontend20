import HeroSection from '@/components/hero-section';
import React from 'react';
import ClassSection from './class&section';
import { useState } from 'react';
import NotificationSystem from '@/components/notification';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

type ActiveSection = 'classes' | 'exams' | 'routine' | 'section';

const AdminSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('classes');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const tabs = [
    { id: 'classes' as ActiveSection, name: 'Classes', icon: '🏫' },
    { id: 'exams' as ActiveSection, name: 'Exams', icon: '📝' },
    { id: 'routine' as ActiveSection, name: 'Routine', icon: '📅' },
    { id: 'section' as ActiveSection, name: 'Section', icon: '📚' },
  ];

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <div className="space-y-6">
      <NotificationSystem 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      
      <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <nav className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                activeSection === tab.id
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
        
        <div className="p-6">
          {/* Hero Section - Always visible */}
          <div className="mb-6">
            <HeroSection />
          </div>

          {/* Dynamic Content based on active section */}
          {activeSection === 'classes' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Class Management</h2>
              <ClassSection addNotification={addNotification} />
            </div>
          )}
          
          {activeSection === 'exams' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Exam Management</h2>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Exam management features coming soon...</p>
              </div>
            </div>
          )}
          
          {activeSection === 'routine' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Routine Management</h2>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Routine management features coming soon...</p>
              </div>
            </div>
          )}
          
          {activeSection === 'section' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Section Management</h2>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Section management features coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;