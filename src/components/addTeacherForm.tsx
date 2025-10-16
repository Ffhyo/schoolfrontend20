import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Fixed validation schema with proper types
const teacherFormSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),

  // Authentication
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),

  // Professional Information
  employeeId: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  subjects: z.array(z.string()),
  gradeLevels: z.array(z.string()),
  qualification: z.string().optional(),
  experience: z.number().min(0, 'Experience cannot be negative'),
  specialization: z.string().optional(),

  // Employment Details
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'substitute']),
  joinDate: z.string().optional(),
  salary: z.number().optional(),
  department: z.string().optional(),

  // Address
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),

  // Emergency Contact
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
  }),

  // Schedule
  schedule: z.object({
    monday: z.array(z.string()),
    tuesday: z.array(z.string()),
    wednesday: z.array(z.string()),
    thursday: z.array(z.string()),
    friday: z.array(z.string()),
    saturday: z.array(z.string()),
    sunday: z.array(z.string()),
  }),

  // Permissions
  permissions: z.object({
    canGradeStudents: z.boolean(),
    canTakeAttendance: z.boolean(),
    canCreateAssignments: z.boolean(),
    canViewAllStudents: z.boolean(),
    canManageClass: z.boolean(),
  }),

  // Administrative
  isActive: z.boolean(),
  status: z.enum(['active', 'on-leave', 'suspended', 'resigned']),
});

type TeacherFormData = z.infer<typeof teacherFormSchema>;
const API_BASE_URL ='https://schoolbackend-un9x.onrender.com'

const AddTeacherForm: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      employeeId: '',
      subject: '',
      subjects: [],
      gradeLevels: [],
      qualification: '',
      experience: 0,
      specialization: '',
      employmentType: 'full-time',
      joinDate: '',
      salary: 0,
      department: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
      permissions: {
        canGradeStudents: true,
        canTakeAttendance: true,
        canCreateAssignments: true,
        canViewAllStudents: false,
        canManageClass: true,
      },
      isActive: true,
      status: 'active',
    },
  });

  const subjects = watch('subjects');
  const gradeLevels = watch('gradeLevels');

  const commonGradeLevels = [
    'Kindergarten', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
  ];

  const addSubject = () => {
    const newSubject = prompt('Enter subject:');
    if (newSubject && !subjects.includes(newSubject)) {
      setValue('subjects', [...subjects, newSubject]);
    }
  };

  const removeSubject = (index: number) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setValue('subjects', newSubjects);
  };

  const addGradeLevel = (grade: string) => {
    if (!gradeLevels.includes(grade)) {
      setValue('gradeLevels', [...gradeLevels, grade]);
    }
  };

  const removeGradeLevel = (index: number) => {
    const newGradeLevels = gradeLevels.filter((_, i) => i !== index);
    setValue('gradeLevels', newGradeLevels);
  };

  const onSubmit = async (data: TeacherFormData) => {
    setLoading(true);
    try {
      console.log(data);
      const response = await fetch(`${API_BASE_URL}/api/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create teacher');
      }

      alert('Teacher created successfully!');
      // Reset form or redirect as needed
      window.location.reload();
    } catch (error) {
      console.error('Error creating teacher:', error);
      alert('Error creating teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Add New Teacher</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  {...register('firstName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  {...register('lastName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <input
                  type="text"
                  {...register('username')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID</label>
                <input
                  type="text"
                  {...register('employeeId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Primary Subject *</label>
                <input
                  type="text"
                  {...register('subject')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Qualification</label>
                <input
                  type="text"
                  {...register('qualification')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Specialization</label>
                <input
                  type="text"
                  {...register('specialization')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience</label>
                <input
                  type="number"
                  {...register('experience', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  {...register('department')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Additional Subjects */}
            <div>
              <label className="block text-sm font-medium mb-1">Additional Subjects</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSubject}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                + Add Subject
              </button>
            </div>

            {/* Grade Levels */}
            <div>
              <label className="block text-sm font-medium mb-1">Grade Levels</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {gradeLevels.map((grade, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {!Number.isNaN(Number(grade)) ? ` Class ${grade}` : grade}
                    <button
                      type="button"
                      onClick={() => removeGradeLevel(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {commonGradeLevels.map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => addGradeLevel(grade)}
                    disabled={gradeLevels.includes(grade)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    class {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Teacher...' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherForm;