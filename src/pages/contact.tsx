import React from 'react';
import Navbar from '@/components/Navbar';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-blue-100">
      <Navbar role="guest" />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-blue-700 mb-8 text-center">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">Get In Touch</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-blue-700">Address</h3>
                <p className="text-gray-700">123 Sunflower Lane<br />City Center, YourCity<br />Country</p>
              </div>
              
              <div>
                <h3 className="font-bold text-blue-700">Phone</h3>
                <p className="text-gray-700">+1 234 567 8901</p>
              </div>
              
              <div>
                <h3 className="font-bold text-blue-700">Email</h3>
                <p className="text-gray-700">info@sunfloweracademy.com</p>
              </div>
              
              <div>
                <h3 className="font-bold text-blue-700">Office Hours</h3>
                <p className="text-gray-700">
                  Monday - Friday: 8:00 AM - 5:00 PM<br />
                  Saturday: 9:00 AM - 1:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">Send us a Message</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your message"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;