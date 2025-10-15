import React from 'react';

const StaffDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">Welcome, Admin!</h2>
        <p className="text-gray-600">Here is a quick overview of your system.</p>
      </section>

      {/* Stats section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <span className="text-xl font-semibold">120</span>
          <span className="text-gray-500">Students</span>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <span className="text-xl font-semibold">15</span>
          <span className="text-gray-500">Teachers</span>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <span className="text-xl font-semibold">8</span>
          <span className="text-gray-500">Staff Members</span>
        </div>
      </section>

      {/* Recent activity or other widgets */}
      <section className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Recent Activities</h3>
        <ul className="space-y-1 text-gray-600">
          <li>John Doe registered as a new student.</li>
          <li>Teacher Smith added a new course.</li>
          <li>Staff updated timetable for next week.</li>
          {/* Replace with dynamic data later */}
        </ul>
      </section>
    </div>
  );
};

export default StaffDashboard;
