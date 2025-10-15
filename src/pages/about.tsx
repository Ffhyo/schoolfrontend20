import React from 'react';
import Navbar from '@/components/Navbar';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-blue-100">
      <Navbar role="guest" />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-blue-700 mb-8 text-center">About Sunflower Academy</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-yellow-700 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-6">
            Sunflower Academy is dedicated to providing a nurturing environment where every child can flourish. 
            Our curriculum blends academics, arts, and sports to foster well-rounded development.
          </p>
          
          <h2 className="text-2xl font-bold text-yellow-700 mb-4">Our Vision</h2>
          <p className="text-lg text-gray-700 mb-6">
            To create lifelong learners who are prepared for success in a rapidly changing world, 
            equipped with critical thinking skills, creativity, and strong moral values.
          </p>
          
          <h2 className="text-2xl font-bold text-yellow-700 mb-4">Our Values</h2>
          <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
            <li>Excellence in Education</li>
            <li>Respect for Individuality</li>
            <li>Community Engagement</li>
            <li>Innovation and Creativity</li>
            <li>Integrity and Honesty</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;