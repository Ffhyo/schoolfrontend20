import { useEffect, useState } from "react";
import UniversalExportClassSchedule from "@/components/routinetable";

interface Subject {
  id: string;
  name: string;
  code?: string;
  
  credits?: number;
  type: 'core' | 'elective' | 'optional';
  passMark?: number | null;
  fullMark?: number | null;
  practicalpassMarks?: number | null;
  practicalfullMarks?: number | null;
}

interface Class {
  id: string;
  name: string;
  sections: string[];
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

interface RoutineProps {
  activeSection: string;
  classes: Class[];
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  routines: ExamRoutine[];
  setRoutines: React.Dispatch<React.SetStateAction<ExamRoutine[]>>;
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function Routine({
  activeSection,
  classes,
  subjects,
  setSubjects,
  routines,
  setRoutines,
  addNotification
}: RoutineProps) {
  const [newRoutine, setNewRoutine] = useState<Omit<ExamRoutine, 'id'>>({
    examName: '',
    classId: '',
    subjectId: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    room: ''
  });

  const [newSubject, setNewSubject] = useState<Omit<Subject, 'id'>>({
    name: '',
    code: '',
    
    credits: 1,
    type: 'core',
    passMark: null,
    fullMark: null,
    practicalpassMarks: null,
    practicalfullMarks: null
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/subjects/subjects');
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const result = await response.json();
      const subjectsArray = Array.isArray(result) ? result : result.data || [];
      const transformedSubjects = subjectsArray.map((sub: any) => ({
        id: sub._id || sub.id,
        name: sub.name,
        code: sub.code,
     
        credits: sub.credits,
        type: sub.type,
        passMark: sub.passMark,
        fullMark: sub.fullMark,
        practicalpassMarks: sub.practicalpassMarks,
        practicalfullMarks: sub.practicalfullMarks
      }));
      setSubjects(transformedSubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      addNotification('Failed to load subjects from server', 'error');
      setSubjects([]);
    }
  };

  // Add routine
  const addRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoutine.examName && newRoutine.classId && newRoutine.subjectId && newRoutine.date) {
      const classObj = classes.find(cls => cls.id === newRoutine.classId);
      const subjectObj = subjects.find(sub => sub.id === newRoutine.subjectId);
     
      const routine: ExamRoutine = {
        ...newRoutine,
        id: Date.now().toString()
      };
      setRoutines([...routines, routine]);
     
      addNotification(`Routine for ${newRoutine.examName} - ${classObj?.name} - ${subjectObj?.name} added successfully!`);
     
      setNewRoutine({
        examName: '',
        classId: '',
        subjectId: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        room: ''
      });
    }
  };

  // Add subject - FIXED
  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.name.trim()) {
      try {
        const subjectData = {
          name: newSubject.name.trim(),
          code: newSubject.code?.trim() || undefined,
          
          credits: newSubject.credits || 1,
          type: newSubject.type,
          passMark: newSubject.passMark,
          fullMark: newSubject.fullMark,
          practicalpassMarks: newSubject.practicalpassMarks,
          practicalfullMarks: newSubject.practicalfullMarks,
        };

        const response = await fetch('http://localhost:8000/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify(subjectData)
        });

        if (!response.ok) {
          throw new Error('Failed to create subject');
        }

        const result = await response.json();
        
        // Add to local state
        const newSubjectWithId: Subject = {
          ...subjectData,
          id: result.data?._id || Date.now().toString()
        };
        
        setSubjects([...subjects, newSubjectWithId]);
        addNotification(`Subject "${newSubject.name}" added successfully!`, 'success');
       
        // Reset form
        setNewSubject({
          name: '',
          code: '',
        
          credits: 1,
          type: 'core',
          passMark: null,
          fullMark: null,
          practicalpassMarks: null,
          practicalfullMarks: null
        });

      } catch (error) {
        console.error('Error adding subject:', error);
        addNotification('Failed to add subject to server', 'error');
      }
    } else {
      addNotification('Please enter a subject name', 'error');
    }
  };

  // Update routine
  const updateRoutine = (id: string, field: keyof ExamRoutine, value: string) => {
    setRoutines(routines.map(routine =>
      routine.id === id ? { ...routine, [field]: value } : routine
    ));
  };

  // Update subject - FIXED with API call
  const updateSubject = async (id: string, field: keyof Subject, value: string | number | null) => {
    const updatedSubjects = subjects.map(subject =>
      subject.id === id ? { ...subject, [field]: value } : subject
    );
    
    // Optimistic update
    setSubjects(updatedSubjects);
    
    try {
      const subjectToUpdate = updatedSubjects.find(sub => sub.id === id);
      if (subjectToUpdate) {
        const response = await fetch(`http://localhost:8000/api/subjects/subjects/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subjectToUpdate)
        });

        if (!response.ok) {
          throw new Error('Failed to update subject');
        }
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      // Revert optimistic update on error
      setSubjects(subjects);
      addNotification('Failed to update subject on server', 'error');
    }
  };

  // Delete routine
  const deleteRoutine = (id: string) => {
    const routineToDelete = routines.find(routine => routine.id === id);
   
    setRoutines(routines.filter(routine => routine.id !== id));
   
    if (routineToDelete) {
      addNotification(`Routine "${routineToDelete.examName}" deleted successfully!`);
    }
  };

  // Delete subject - FIXED with API call
  const deleteSubject = async (id: string) => {
    const subjectToDelete = subjects.find(subject => subject.id === id);
   
    if (!subjectToDelete) return;

    // Check if this subject is being used in any routine
    const subjectInUse = routines.some(routine => routine.subjectId === id);
    if (subjectInUse) {
      addNotification('Cannot delete subject: it is being used in exam routines.', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${subjectToDelete.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/subjects/subjects/delete/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }

      // Remove from local state
      setSubjects(subjects.filter(subject => subject.id !== id));
      addNotification(`Subject "${subjectToDelete.name}" deleted successfully!`, 'success');
      
    } catch (error) {
      console.error('Error deleting subject:', error);
      addNotification('Failed to delete subject from server', 'error');
    }
  };

  // Start editing routine
  const startEditing = (id: string) => {
    setEditingId(id);
  };

  // Start editing subject
  const startEditingSubject = (id: string) => {
    setEditingSubjectId(id);
  };

  // Stop editing routine
  const stopEditing = () => {
    const routine = routines.find(r => r.id === editingId);
    if (routine) {
      addNotification(`Routine "${routine.examName}" updated successfully!`);
    }
    setEditingId(null);
  };

  // Stop editing subject
  const stopEditingSubject = () => {
    const subject = subjects.find(s => s.id === editingSubjectId);
    if (subject) {
      addNotification(`Subject "${subject.name}" updated successfully!`);
    }
    setEditingSubjectId(null);
  };

  // Get class name by ID
  const getClassName = (classId: string) => {
    return classes.find(cls => cls.id === classId)?.name || 'N/A';
  };

  // Get subject name by ID
  const getSubjectName = (subjectId: string) => {
    return subjects.find(subject => subject.id === subjectId)?.name || 'N/A';
  };

  return (
    <>
      {activeSection === 'routine' && (
        <div className="space-y-8">
          {/* Subject Management Section */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-3xl font-bold text-green-700 mb-6 border-b pb-2">
              Subject Management
            </h2>
            
            {/* Add Subject Form */}
            <form onSubmit={addSubject} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Subject</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    placeholder="Mathematics, Science, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                    placeholder="MATH101"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Type
                  </label>
                  <select
                    value={newSubject.type}
                    onChange={(e) => setNewSubject({...newSubject, type: e.target.value as Subject['type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="core">Core</option>
                    <option value="elective">Elective</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject({...newSubject, credits: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pass Mark
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSubject.passMark ?? ''}
                    onChange={(e) => setNewSubject({...newSubject, passMark: e.target.value === '' ? null : parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Mark
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSubject.fullMark ?? ''}
                    onChange={(e) => setNewSubject({...newSubject, fullMark: e.target.value === '' ? null : parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Practical Pass Mark
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSubject.practicalpassMarks ?? ''}
                    onChange={(e) => setNewSubject({...newSubject, practicalpassMarks: e.target.value === '' ? null : parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Practical Full Mark
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSubject.practicalfullMarks ?? ''}
                    onChange={(e) => setNewSubject({...newSubject, practicalfullMarks: e.target.value === '' ? null : parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Subject
              </button>
            </form>

            {/* Subjects Table */}
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">All Subjects</h3>
              {subjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No subjects added yet.</p>
              ) : (
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Teacher
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Credits
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Pass Mark
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Full Mark
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                          {editingSubjectId === subject.id ? (
                            <input
                              type="text"
                              value={subject.name}
                              onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            subject.name
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b">
                          {editingSubjectId === subject.id ? (
                            <input
                              type="text"
                              value={subject.code || ''}
                              onChange={(e) => updateSubject(subject.id, 'code', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            subject.code || '-'
                          )}
                        </td>
                      
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b">
                          {editingSubjectId === subject.id ? (
                            <select
                              value={subject.type}
                              onChange={(e) => updateSubject(subject.id, 'type', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            >
                              <option value="core">Core</option>
                              <option value="elective">Elective</option>
                              <option value="optional">Optional</option>
                            </select>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              subject.type === 'core'
                                ? 'bg-blue-100 text-blue-800'
                                : subject.type === 'elective'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b">
                          {editingSubjectId === subject.id ? (
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={subject.credits || 1}
                              onChange={(e) => updateSubject(subject.id, 'credits', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            subject.credits || 1
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b">
                          {editingSubjectId === subject.id ? (
                            <input
                              type="number"
                              min="0"
                              value={subject.passMark ?? ''}
                              onChange={(e) => updateSubject(subject.id, 'passMark', e.target.value === '' ? null : parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            subject.passMark ?? '-'
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b">
                          {editingSubjectId === subject.id ? (
                            <input
                              type="number"
                              min="0"
                              value={subject.fullMark ?? ''}
                              onChange={(e) => updateSubject(subject.id, 'fullMark', e.target.value === '' ? null : parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            subject.fullMark ?? '-'
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium border-b">
                          {editingSubjectId === subject.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={stopEditingSubject}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSubjectId(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditingSubject(subject.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteSubject(subject.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Exam Routine Section */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-3xl font-bold text-green-700 mb-6 border-b pb-2">
              Exam Routine Table
            </h2>
            
            {/* Add Routine Form */}
            <form onSubmit={addRoutine} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Exam Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Name *
                  </label>
                  <input
                    type="text"
                    value={newRoutine.examName}
                    onChange={(e) => setNewRoutine({...newRoutine, examName: e.target.value})}
                    placeholder="Mid-Term, Final, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    value={newRoutine.classId}
                    onChange={(e) => setNewRoutine({...newRoutine, classId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={newRoutine.subjectId}
                    onChange={(e) => setNewRoutine({...newRoutine, subjectId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} {subject.code ? `(${subject.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newRoutine.date}
                    onChange={(e) => setNewRoutine({...newRoutine, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newRoutine.startTime}
                    onChange={(e) => setNewRoutine({...newRoutine, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newRoutine.endTime}
                    onChange={(e) => setNewRoutine({...newRoutine, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    value={newRoutine.room}
                    onChange={(e) => setNewRoutine({...newRoutine, room: e.target.value})}
                    placeholder="Room number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add to Routine
              </button>
            </form>

            {/* Routine Table */}
            <UniversalExportClassSchedule />
          </div>
        </div>
      )}
    </>
  );
}