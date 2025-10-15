import React from 'react';
import AddTeacherForm from '@/components/addTeacherForm';

const AdminTeachers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
          Add New Teacher
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Teaching Staff</h2>
        <p>Teacher management content goes here...</p>
        <AddTeacherForm />
      </div>
    </div>
  );
};

export default AdminTeachers;