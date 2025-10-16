import { useEffect, useState } from 'react';
import Routine from './routine';

interface Class {
  id: string;
  name: string;
  sections: string[];
}

interface Subject {
  id: string;
  name: string;
  code?: string;
  teacher?: string;
  credits?: number;
  type: 'core' | 'elective' | 'optional';
  passMark?: number | null;
  fullMark?: number | null;
  practicalpassMarks?: number | null;
  practicalfullMarks?: number | null;
}

interface Exam {
  id: string;
  name: string;
  classIds: string[]; // Changed from classId to classIds array
  date: string;
  // Removed subject field
}
interface Routine {
  id: string;
  examId: string;
  classId: string;
  subjectId: string;
  date: string;
  time: string;
}
interface ExamRoutine {
  id: string;
  examName: string;
  classId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
}


type ActiveSection = 'classes' | 'exams' | 'routine';

interface ClassSectionProps {
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const API_BASE_URL='https://schoolbackend-un9x.onrender.com'

export default function ClassSection({ addNotification }: ClassSectionProps) {
  // Active section state
  const [activeSection, setActiveSection] = useState<ActiveSection>('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [exams, setExams] = useState<Exam[]>([]);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [selectedExamClasses, setSelectedExamClasses] = useState<Set<string>>(new Set());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [routines, setRoutines] = useState<ExamRoutine[]>([]);

  const handleRoutineNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    addNotification(message, type);
  };




  // Navigation tabs
  const tabs = [
    { id: 'classes' as ActiveSection, name: 'Class Management', icon: '🏫' },
    { id: 'exams' as ActiveSection, name: 'Exam Setup', icon: '📝' },
    { id: 'routine' as ActiveSection, name: 'Exam Routine', icon: '📅' },
  ];

  // Fetch classes function
  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class-sections`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      
      const result = await response.json();
      
      let classesArray;
      
      if (result.success && Array.isArray(result.data)) {
        classesArray = result.data;
      } else if (Array.isArray(result)) {
        classesArray = result;
      } else if (result.data && Array.isArray(result.data)) {
        classesArray = result.data;
      } else {
        console.error('Unexpected response format:', result);
        throw new Error('Unexpected response format from server');
      }
      
      const transformedClasses = classesArray.map((cls: any) => ({
        id: cls._id || cls.id,
        name: cls.name,
        sections: cls.sections || []
      }));
      
      setClasses(transformedClasses);
      
    } catch (error) {
      console.error('Error fetching classes:', error);
      addNotification('Failed to load classes from server', 'error');
      setClasses([]);
    }
  };






  //---------------------------------------------class and section-------------------------------------------
  useEffect(() => {
    fetchClasses();
    fetchExam();
    // Fetch exams on component mount
  }, []);

  // Add new class
  const addClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      addNotification('Please enter a class name', 'error');
      return;
    }

    const newClass: Class = {
      id: Date.now().toString(),
      name: newClassName.trim(),
      sections: []
    };
    
    // Optimistic update
    setClasses(prev => [...prev, newClass]);
    addNotification(`Class "${newClassName.trim()}" added successfully!`);
    setNewClassName('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/class-sections/create`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newClassName.trim(),
          sections: []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add class to backend');
      }
      
      // Refresh to get the actual ID from backend
      await fetchClasses();
      
    } catch (error) {
      console.error("Backend error:", error);
      // Revert optimistic update on error
      setClasses(prev => prev.filter(cls => cls.id !== newClass.id));
      addNotification('Failed to save class to server', 'error');
    }
  };

  // Update class name
  const updateClass = async (classId: string) => {
    if (!editClassName.trim()) {
      addNotification('Please enter a class name', 'error');
      return;
    }

    const originalClasses = [...classes];
    
    // Optimistic update
    setClasses(classes.map(cls => 
      cls.id === classId ? { ...cls, name: editClassName.trim() } : cls
    ));
    setEditingClassId(null);
    setEditClassName('');

    try {
      const response = await fetch(` ${API_BASE_URL}/api/class-sections/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editClassName.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to update class in backend');
      }

      addNotification(`Class updated to "${editClassName.trim()}" successfully!`);
      await fetchClasses(); // Refresh data
      
    } catch (error) {
      console.error("Backend error:", error);
      // Revert on error
      setClasses(originalClasses);
      addNotification('Failed to update class on server', 'error');
    }
  };

  // Delete class
  const deleteClass = async (classId: string) => {
    const classToDelete = classes.find(cls => cls.id === classId);
    if (!classToDelete) return;

    const originalClasses = [...classes];
    
    // Optimistic update
    setClasses(classes.filter(cls => cls.id !== classId));
    const newSelected = new Set(selectedClasses);
    newSelected.delete(classId);
    setSelectedClasses(newSelected);

    try {
      const response = await fetch(` ${API_BASE_URL}/api/class-sections/${classId}/delete`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete class from backend');
      }

      addNotification(`Class "${classToDelete.name}" deleted successfully!`);
      
    } catch (error) {
      console.error("Backend error:", error);
      // Revert on error
      setClasses(originalClasses);
      addNotification('Failed to delete class from server', 'error');
    }
  };

  // Delete multiple classes
  const deleteSelectedClasses = async () => {
    const classesToDelete = classes.filter(cls => selectedClasses.has(cls.id));
    if (classesToDelete.length === 0) return;

    const originalClasses = [...classes];
    
    // Optimistic update
    setClasses(classes.filter(cls => !selectedClasses.has(cls.id)));
    addNotification(`${classesToDelete.length} class(es) deleted successfully!`);
    setSelectedClasses(new Set());

    try {
      // Delete each class from backend
      await Promise.all(
        classesToDelete.map(cls => 
          fetch(` ${API_BASE_URL}/api/class-sections/${cls.id}`, {
            method: 'DELETE'
          })
        )
      );
      
    } catch (error) {
      console.error("Backend error:", error);
      // Revert on error
      setClasses(originalClasses);
      addNotification('Failed to delete classes from server', 'error');
    }
  };

  // Toggle class selection
  const toggleClassSelection = (classId: string) => {
    const newSelected = new Set(selectedClasses);
    if (newSelected.has(classId)) {
      newSelected.delete(classId);
    } else {
      newSelected.add(classId);
    }
    setSelectedClasses(newSelected);
  };

  // Select all classes
  const selectAllClasses = () => {
    if (selectedClasses.size === classes.length) {
      setSelectedClasses(new Set());
    } else {
      setSelectedClasses(new Set(classes.map(cls => cls.id)));
    }
  };

  // Start editing class
  const startEditingClass = (classObj: Class) => {
    setEditingClassId(classObj.id);
    setEditClassName(classObj.name);
  };

  // Cancel editing class
  const cancelEditingClass = () => {
    setEditingClassId(null);
    setEditClassName('');
  };

  // Add section to class
  const addSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !newSectionName.trim()) {
      addNotification('Please select a class and enter section name', 'error');
      return;
    }

    const classToUpdate = classes.find(cls => cls.id === selectedClass);
    if (!classToUpdate) {
      addNotification('Class not found', 'error');
      return;
    }

    // Optimistic update
    const updatedClasses = classes.map(cls => 
      cls.id === selectedClass 
        ? { ...cls, sections: [...cls.sections, newSectionName.trim()] }
        : cls
    );
    setClasses(updatedClasses);
    setNewSectionName('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/class-sections/${selectedClass}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: newSectionName.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add section to backend');
      }

      await fetchClasses(); // Refresh data
      addNotification(`Section "${newSectionName.trim()}" added to "${classToUpdate.name}" successfully!`);
      
    } catch (error) {
      console.error("Backend error:", error);
      // Revert optimistic update
      setClasses(classes);
      addNotification('Failed to save section to server', 'error');
    }
  };

  // Delete section from class
  const deleteSection = async (classId: string, sectionIndex: number) => {
    const classToUpdate = classes.find(cls => cls.id === classId);
    const sectionName = classToUpdate?.sections[sectionIndex];
    
    if (!classToUpdate || sectionName === undefined) {
      addNotification('Class or section not found', 'error');
      return;
    }

    const originalClasses = [...classes];
    
    // Optimistic update
    const updatedClasses = classes.map(cls => 
      cls.id === classId 
        ? { ...cls, sections: cls.sections.filter((_, index) => index !== sectionIndex) }
        : cls
    );
    setClasses(updatedClasses);

    try {
      const response = await fetch(` ${API_BASE_URL}/api/class-sections/${classId}/sections/${sectionIndex}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete section from backend');
      }

      addNotification(`Section "${sectionName}" deleted from "${classToUpdate.name}" successfully!`);
      
    } catch (error) {
      console.error("Backend error:", error);
      // Revert on error
      setClasses(originalClasses);
      addNotification('Failed to delete section from server', 'error');
    }
  };

  // Exam Functions - UPDATED
  // Toggle individual class selection for exams
  const toggleExamClassSelection = (classId: string) => {
    const newSelected = new Set(selectedExamClasses);
    if (newSelected.has(classId)) {
      newSelected.delete(classId);
    } else {
      newSelected.add(classId);
    }
    setSelectedExamClasses(newSelected);
  };

  // Select all classes for exams
  const selectAllExamClasses = () => {
    if (selectedExamClasses.size === classes.length) {
      setSelectedExamClasses(new Set());
    } else {
      setSelectedExamClasses(new Set(classes.map(cls => cls.id)));
    }
  };

  // Select range of classes (by indices)
  const selectClassRange = (startIndex: number, endIndex: number) => {
    const classIdsInRange = classes
      .slice(startIndex, endIndex + 1)
      .map(cls => cls.id);
    setSelectedExamClasses(new Set(classIdsInRange));
  };
//---------------------------------------------exam-------------------------------------------
  // Add exam with multiple classes

  const addExam = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!examName.trim() || selectedExamClasses.size === 0 || !examDate) {
    addNotification('Please fill all required fields and select at least one class', 'error');
    return;
  }

  const selectedClassIds = Array.from(selectedExamClasses);
  const selectedClassNames = classes
    .filter(cls => selectedExamClasses.has(cls.id))
    .map(cls => cls.name)
    .join(', ');

  try {
    // Make API call first
    const response = await fetch(`${API_BASE_URL}/api/exam/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: examName.trim(),
        classIds: selectedClassIds,
        date: examDate
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create exam');
    }
    
    const newExamFromServer = await response.json();
    

    // Update state only after successful API call
   
    setExams(prev => [...prev, {
      id: newExamFromServer._id || newExamFromServer.id || Date.now().toString(),
      name: newExamFromServer.name,
      classIds: newExamFromServer.classIds,
      date: newExamFromServer.date
    }]);

    addNotification(`Exam "${examName.trim()}" for ${selectedClassNames} added successfully!`);

    // Reset form
    setExamName('');
    setExamDate('');
    setSelectedExamClasses(new Set());

  } catch (error) {
    console.error("Backend error:", error);
    addNotification('Failed to save exam to server', 'error');
  }
};
const fetchExam = async () => {
  try {
    console.log('Fetching exams from: http://localhost:8000/api/exams/detail');
    
    const response = await fetch(` ${API_BASE_URL}/api/exam/exams/detail`);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exams: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Raw API response:', result);
    
    let examsArray;
    
    // Handle different response formats
    if (result.success && Array.isArray(result.data)) {
      examsArray = result.data;
    } else if (Array.isArray(result)) {
      examsArray = result;
    } else if (result.data && Array.isArray(result.data)) {
      examsArray = result.data;
    } else {
      console.error('Unexpected response format:', result);
      throw new Error('Unexpected response format from server');
    }
    
    console.log('Processed exams array:', examsArray);
    
    const transformedExams = examsArray.map((exam: any) => ({
      id: exam._id || exam.id,
      name: exam.name,
      classIds: exam.classIds || [],
      date: exam.date
    }));
    
    console.log('Transformed exams:', transformedExams);
    setExams(transformedExams);
    
  } catch (error) {
    console.error('Error fetching exams:', error);
    addNotification('Failed to load exams from server', 'error');
    setExams([]);
  }
};
  // Delete exam
  const deleteExam =async (id: string) => {
    const examToDelete = exams.find(exam => exam.id === id);
    setExams(exams.filter(exam => exam.id !== id));
    
    if (examToDelete) {
      try{
         const response = await fetch(`${API_BASE_URL}/api/exam/exams/'+id+'/delete`,{ 
        method: 'DELETE'

       } )
        if (!response.ok) { 
        throw new Error('Failed to delete exam from backend');
          
      }}catch(error){
        console.error("Backend error:", error);
      }
    }
  };

  // Get class names by IDs
  const getClassNames = (classIds: string[]) => {
    return classIds
      .map(classId => classes.find(cls => cls.id === classId)?.name)
      .filter(Boolean)
      .join(', ');
  };



 
  return (
    <div className="max-w-7xl mx-auto mt-10 px-6">
      {/* Header with Navigation Tabs */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-800 mb-2">School Management System</h1>
        <p className="text-gray-600 mb-6">Manage classes, exams, and routines in one place</p>
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeSection === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Class Management Section */}
      {activeSection === 'classes' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-green-700 mb-6 border-b pb-2">
              Class and Section Management
            </h2>

            <div className="flex flex-col gap-5 bg-white shadow-md rounded-lg p-6 border border-gray-200">
              {/* Add Class Form */}
              <form onSubmit={addClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Class
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Enter class name (e.g., Grade 1)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Add Class
                    </button>
                  </div>
                </div>
              </form>

              {/* Add Section Form */}
              <form onSubmit={addSection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Section to Class
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select a class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Enter section name (e.g., A)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="submit"
                      disabled={!selectedClass}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Add Section
                    </button>
                  </div>
                </div>
              </form>

              {/* Bulk Actions */}
              {classes.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedClasses.size === classes.length && classes.length > 0}
                      onChange={selectAllClasses}
                      className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      {selectedClasses.size > 0 
                        ? `${selectedClasses.size} class(es) selected`
                        : 'Select all classes'
                      }
                    </span>
                  </div>
                  {selectedClasses.size > 0 && (
                    <button
                      onClick={deleteSelectedClasses}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      Delete Selected ({selectedClasses.size})
                    </button>
                  )}
                </div>
              )}

              {/* Classes and Sections List */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Classes and Sections</h3>
                <div className="space-y-4">
                  {classes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No classes added yet.</p>
                  ) : (
                    classes.map(cls => (
                      <div key={cls.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedClasses.has(cls.id)}
                              onChange={() => toggleClassSelection(cls.id)}
                              className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                            />
                            {editingClassId === cls.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={editClassName}
                                  onChange={(e) => setEditClassName(e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                  placeholder="Class name"
                                />
                                <button
                                  onClick={() => updateClass(cls.id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditingClass}
                                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <h4 className="font-medium text-gray-800 text-lg">{cls.name}</h4>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditingClass(cls)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteClass(cls.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        {cls.sections.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {cls.sections.map((section, index) => (
                              <div key={index} className="flex items-center space-x-1">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                  Section {section}
                                </span>
                                <button
                                  onClick={() => deleteSection(cls.id, index)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                  title="Delete section"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm mt-2">No sections added</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------Exam Setup Section - UPDATED------------------------ */}


      {activeSection === 'exams' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-green-700 mb-6 border-b pb-2">
              Exam Setup
            </h2>

            <div className="flex flex-col gap-5 bg-white shadow-md rounded-lg p-6 border border-gray-200">
              {/* Add Exam Form - UPDATED */}
              <form onSubmit={addExam} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Name *
                    </label>
                    <input
                      type="text"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      placeholder="Enter exam name (e.g., Mid-Term, Final)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Date *
                    </label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Class Selection Section - UPDATED */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Classes *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllExamClasses}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        {selectedExamClasses.size === classes.length ? 'Deselect All' : 'Select All'}
                      </button>
                      {classes.length > 1 && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => selectClassRange(0, Math.floor(classes.length / 2) - 1)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            First Half
                          </button>
                          <button
                            type="button"
                            onClick={() => selectClassRange(Math.floor(classes.length / 2), classes.length - 1)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Second Half
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {classes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No classes available. Please add classes first.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-3 border border-gray-200 rounded-md">
                      {classes.map((cls, ) => (
                        <div key={cls.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`exam-class-${cls.id}`}
                            checked={selectedExamClasses.has(cls.id)}
                            onChange={() => toggleExamClassSelection(cls.id)}
                            className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <label 
                            htmlFor={`exam-class-${cls.id}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {cls.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    {selectedExamClasses.size > 0 
                      ? `${selectedExamClasses.size} class(es) selected`
                      : 'No classes selected'
                    }
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!examName.trim() || selectedExamClasses.size === 0 || !examDate}
                  className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Schedule Exam
                </button>
              </form>

              {/* Exams List - UPDATED */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Scheduled Exams</h3>
                <div className="space-y-3">
                  {exams.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No exams scheduled yet.</p>
                  ) : (
                    exams.map(exam => (
                      <div key={exam.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-lg">{exam.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Classes:</span> {getClassNames(exam.classIds)}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Date:</span> {new Date(exam.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Affecting {exam.classIds.length} class{exam.classIds.length !== 1 ? 'es' : ''}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm whitespace-nowrap">
                              {new Date(exam.date).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => deleteExam(exam.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*------------------------------------ Exam Routine Section---------------------------- */}
    {
      activeSection === 'routine' && (
         <Routine 
          activeSection={activeSection}
          classes={classes}
          subjects={subjects}
          setSubjects={setSubjects}
          routines={routines}
          setRoutines={setRoutines}
          addNotification={handleRoutineNotification}
        />)
    }
    </div>
  );
}