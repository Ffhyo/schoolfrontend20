import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  nationality?: string;
  
  // Parent Information
  fathersName: string;
  mothersName: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  parentPhoneNumber: string;
  parentEmail?: string;
  emergencyContact?: string;
  
  // Address
  temporaryAddress?: string;
  permanentAddress?: string;
  
  // Academic Information
  Class: number | string;
  section: string;
  rollNumber: string;
  admissionDate: string;
  symbolNumber?: number;
  
  // House System
  house: string;
  
  // Previous School
  previousSchool?: string;
  
  // Medical Information
  medicalConditions?: string;
  allergies?: string;
  medication?: string;
  
  // Transportation
  transportation?: string;
  busRoute?: string;
  busStop?: string;
  
  // Additional
  hobbies?: string;
  achievements?: string;
  remarks?: string;
  status: string;
}

interface AdminInfo {
  id: string;
  username: string;
  assignedSections: string[];
  permissions: {
    canManageStudents: boolean;
    canManageTeachers: boolean;
    canManageCourses: boolean;
    canViewAnalytics: boolean;
  };
}

interface FilterOptions {
  classes: string[] ;
  houses: string[];
  sections: string[];
}

interface StudentsResponse {
  students: Student[];
  totalPages: number;
  currentPage: number;
  total: number;
  adminSections: string[];
  filterOptions: FilterOptions;
}

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ 
    classes: [], 
    houses: [], 
    sections: [] 
  });
  const { adminId } = useParams<{ adminId: string }>();
  
  const API_BASE_URL = 'http://localhost:8000/api';
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const itemsPerPage = 10;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!adminId) {
          throw new Error('Admin ID not found in URL');
        }

        // Fetch students with current filters
        await fetchStudentsWithFilters();

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [adminId]);

  // Fetch students with all filters
  const fetchStudentsWithFilters = async (page: number = currentPage) => {
    try {
      if (!adminId) return;

      let url = `${API_BASE_URL}/admins/${adminId}/students?page=${page}&limit=${itemsPerPage}`;
      
      const params = new URLSearchParams();
      if (sectionFilter) params.append('section', sectionFilter);
      if (classFilter) params.append('Class', classFilter);
      if (houseFilter) params.append('house', houseFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'All Status') {
        params.append('status', statusFilter);
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `&${queryString}`;
      }

      console.log('Fetching students from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data: StudentsResponse = await response.json();
      
      setStudents(data.students || []);
      setTotalPages(data.totalPages || 1);
      setTotalStudents(data.total || 0);
      setCurrentPage(data.currentPage || 1);
      setFilterOptions(data.filterOptions || { classes: [], houses: [], sections: [] });

      // Set admin info from the response
      if (data.adminSections) {
        setAdminInfo({
          id: adminId,
          username: 'Admin',
          assignedSections: data.adminSections,
          permissions: {
            canManageStudents: true,
            canManageTeachers: true,
            canManageCourses: true,
            canViewAnalytics: true
          }
        });
      }

    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchStudentsWithFilters(newPage);
  };

  // Handle filter changes
  const handleSectionFilterChange = (section: string) => {
    setSectionFilter(section);
  };

  const handleClassFilterChange = (studentClass: string) => {
    setClassFilter(studentClass);
  };

  const handleHouseFilterChange = (house: string) => {
    setHouseFilter(house);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStudentsWithFilters(1);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchStudentsWithFilters(1);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSectionFilter('');
    setClassFilter('');
    setHouseFilter('');
    setStatusFilter('');
    setCurrentPage(1);
    fetchStudentsWithFilters(1);
    setShowFilters(false);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return sectionFilter || classFilter || houseFilter || statusFilter || searchTerm;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return 'N/A';
    }
  };

  // Handle actions
  const handleAddStudent = async () => {
    if (!adminInfo?.permissions.canManageStudents) {
      alert('You do not have permission to add students');
      return;
    }

    console.log('Add new student clicked');
    alert('Add student functionality - Implement form modal or navigation');
  };

  const handleEditStudent = (studentId: string) => {
    if (!adminInfo?.permissions.canManageStudents) {
      alert('You do not have permission to edit students');
      return;
    }

    console.log('Edit student:', studentId);
    alert(`Edit student ${studentId} - Implement edit form`);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!adminInfo?.permissions.canManageStudents) {
      alert('You do not have permission to delete students');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchStudentsWithFilters();
        alert('Student deleted successfully');
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to delete student');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      alert(`Error deleting student: ${err instanceof Error ? err.message : 'Please try again.'}`);
    }
  };

  const handleViewStudent = (studentId: string) => {
    console.log('View student:', studentId);
    alert(`View student details for ${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-lg text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={() => fetchStudentsWithFilters()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          {adminInfo && (
            <p className="text-sm text-gray-600 mt-1">
              Assigned sections: {adminInfo.assignedSections.join(', ')}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              hasActiveFilters() 
                ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
            {hasActiveFilters() && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
          
          {adminInfo?.permissions.canManageStudents && (
            <button 
              onClick={handleAddStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add New Student
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex">
              <input
                type="text"
                placeholder="Search by name, email, roll number, father's name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
          
          {/* Active Filters Badge */}
          {hasActiveFilters() && (
            <div className="flex items-center">
              <button
                onClick={handleResetFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sectionFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Section: {sectionFilter}
                <button 
                  onClick={() => setSectionFilter('')}
                  className="ml-1 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
            {classFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Class: {classFilter}
                <button 
                  onClick={() => setClassFilter('')}
                  className="ml-1 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            )}
            {houseFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                House: {houseFilter}
                <button 
                  onClick={() => setHouseFilter('')}
                  className="ml-1 hover:text-purple-600"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Status: {statusFilter}
                <button 
                  onClick={() => setStatusFilter('')}
                  className="ml-1 hover:text-orange-600"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expandable Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Advanced Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Section Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <select
                value={sectionFilter}
                onChange={(e) => handleSectionFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sections</option>
                {filterOptions.sections.map((section, index) => (
                  <option key={`section-${section}-${index}`} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                value={classFilter}
                onChange={(e) => handleClassFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {filterOptions.classes.map((cls, index) => (
                  <option key={`class-${cls}-${index}`} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* House Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                House
              </label>
              <select
                value={houseFilter}
                onChange={(e) => handleHouseFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Houses</option>
                {filterOptions.houses.map((house, index) => (
                  <option key={`house-${house}-${index}`} value={house}>
                    {house} House
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            All Students ({totalStudents})
          </h2>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class & Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  House
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {adminInfo?.permissions.canManageStudents && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={adminInfo?.permissions.canManageStudents ? 7 : 6} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {totalStudents === 0 ? 'No students in the system.' : 'No students match your current filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div 
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                            onClick={() => handleViewStudent(student._id)}
                          >
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            @{student.username} • Age: {calculateAge(student.dateOfBirth)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Class {student.Class}</div>
                      <div className="text-sm text-gray-500">Section {student.section}</div>
                      <div className="text-xs text-gray-400">Roll: {student.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.house === 'Red' ? 'bg-red-100 text-red-800' :
                        student.house === 'Blue' ? 'bg-blue-100 text-blue-800' :
                        student.house === 'Green' ? 'bg-green-100 text-green-800' :
                        student.house === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.house} House
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.fathersName}</div>
                      <div className="text-sm text-gray-500">{student.parentPhoneNumber}</div>
                      <div className="text-xs text-gray-400">{student.parentEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(student.admissionDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    {adminInfo?.permissions.canManageStudents && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditStudent(student._id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit Student"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete Student"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages} ({totalStudents} total students)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;