import React from 'react';

const AdminCourses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
          Create New Course
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">All Courses</h2>
        <p>Course management content goes here...</p>
      </div>
    </div>
  );
};

export default AdminCourses;