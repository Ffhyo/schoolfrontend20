import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  fathersName: string;
  mothersName: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  parentPhoneNumber: string;
  parentEmail?: string;
  emergencyContact?: string;
  temporaryAddress?: string;
  permanentAddress?: string;
  Class: number | string;
  section: string;
  rollNumber: string;
  admissionDate: string;
  symbolNumber?: number;
  house: string;
  previousSchool?: string;
  medicalConditions?: string;
  allergies?: string;
  medication?: string;
  transportation?: string;
  busRoute?: string;
  busStop?: string;
  hobbies?: string;
  achievements?: string;
  remarks?: string;
  status: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  passMark: number;
  fullMark: number;
  practicalpassMarks?: number;
  practicalfullMarks?: number;
  type: string;
}

interface MarksEntry {
  studentId: string;
  subjectId: string;
  theoryMarks: number;
  practicalMarks?: number;
  examType: string;
  totalMarks?: number;
  grade?: string;
  status?: string;
}

export default function Report() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const [assignGrade, setAssignGrade] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [sections, setSections] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [examType, setExamType] = useState<string>("midterm");
  const [marksData, setMarksData] = useState<MarksEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchTeacher = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/teachers/${teacherId}`);
      if (!response.ok) throw new Error("Failed to fetch teacher data");
      const data = await response.json();
      setAssignGrade(data.teacher.gradeLevels || []);
      return data.teacher;
    } catch (error) {
      console.error("Error fetching teacher:", error);
      return null;
    }
  };

  const fetchStudentByClassAndSection = async () => {
    if (!selectedClass) return;
    try {
      const response = await fetch(`http://localhost:8000/api/students/getStudentByClass/${selectedClass}`);
      if (!response.ok) throw new Error("Failed to fetch student data");
      const data = await response.json();
      setStudents(data.data);
      
      // Extract unique sections from students
      const uniqueSections = Array.from(new Set(data.data.map((student: Student) => student.section))).filter(Boolean) as string[];
      setSections(uniqueSections);
      
      // Auto-select first section if available
      if (uniqueSections.length > 0 && !selectedSection) {
        setSelectedSection(uniqueSections[0]);
      }
      
      // Initialize marks data for filtered students
      const filtered = selectedSection 
        ? data.data.filter((student: Student) => student.section === selectedSection)
        : data.data;
      
      setFilteredStudents(filtered);
      
      const initialMarksData = filtered.map((student: Student) => ({
        studentId: student._id,
        subjectId: selectedSubject,
        theoryMarks: 0,
        practicalMarks: 0,
        examType: examType,
        totalMarks: 0,
        grade: '',
        status: 'fail'
      }));
      setMarksData(initialMarksData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/subjects/subjects');
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleMarksChange = (studentId: string, field: string, value: string) => {
    const numericValue = field.includes('Marks') ? parseFloat(value) || 0 : value;
    
    setMarksData(prev => prev.map(item => {
      if (item.studentId === studentId) {
        const updatedItem = { ...item, [field]: numericValue };
        
        // Calculate total marks and status
        if (field === 'theoryMarks' || field === 'practicalMarks') {
          const subject = subjects.find(s => s._id === updatedItem.subjectId);
          if (subject) {
            updatedItem.totalMarks = (updatedItem.theoryMarks || 0) + (updatedItem.practicalMarks || 0);
            
            // Determine pass/fail status
            const theoryPass = updatedItem.theoryMarks >= subject.passMark;
            const practicalPass = !subject.practicalpassMarks || (updatedItem.practicalMarks || 0) >= subject.practicalpassMarks;
            updatedItem.status = theoryPass && practicalPass ? 'pass' : 'fail';
            
            // Calculate grade (simple example)
            const percentage = (updatedItem.totalMarks / subject.fullMark) * 100;
            if (percentage >= 90) updatedItem.grade = 'A+';
            else if (percentage >= 80) updatedItem.grade = 'A';
            else if (percentage >= 70) updatedItem.grade = 'B+';
            else if (percentage >= 60) updatedItem.grade = 'B';
            else if (percentage >= 50) updatedItem.grade = 'C+';
            else if (percentage >= 40) updatedItem.grade = 'C';
            else updatedItem.grade = 'F';
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmitMarks = async () => {
    if (!selectedClass || !selectedSubject) {
      setMessage({ type: 'error', text: 'Please select both class and subject' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8000/api/exam-marks/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marksEntries: marksData,
          enteredBy: teacherId
        }),
      });

      if (!response.ok) throw new Error("Failed to submit marks");

      const result = await response.json();
      setMessage({ type: 'success', text: 'Marks submitted successfully!' });
      console.log('Marks submission result:', result);
      
    } catch (error) {
      console.error("Error submitting marks:", error);
      setMessage({ type: 'error', text: 'Failed to submit marks' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter students when section changes
  useEffect(() => {
    if (students.length > 0) {
      const filtered = selectedSection 
        ? students.filter(student => student.section === selectedSection)
        : students;
      setFilteredStudents(filtered);
      
      // Update marks data for filtered students
      const initialMarksData = filtered.map(student => ({
        studentId: student._id,
        subjectId: selectedSubject,
        theoryMarks: 0,
        practicalMarks: 0,
        examType: examType,
        totalMarks: 0,
        grade: 'F',
        status: 'fail'
      }));
      setMarksData(initialMarksData);
    }
  }, [selectedSection, students, selectedSubject, examType]);

  // Reset section when class changes
  useEffect(() => {
    setSelectedSection("");
    setSections([]);
    setFilteredStudents([]);
    if (selectedClass) {
      fetchStudentByClassAndSection();
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchTeacher();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentByClassAndSection();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject && filteredStudents.length > 0) {
      const initialMarksData = filteredStudents.map(student => ({
        studentId: student._id,
        subjectId: selectedSubject,
        theoryMarks: 0,
        practicalMarks: 0,
        examType: examType,
        totalMarks: 0,
        grade: 'F',
        status: 'fail'
      }));
      setMarksData(initialMarksData);
    }
  }, [selectedSubject, filteredStudents, examType]);

  const getCurrentSubject = () => {
    return subjects.find(subject => subject._id === selectedSubject);
  };

  const currentSubject = getCurrentSubject();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Exam Marks Entry Form</h2>
      
      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Class</option>
            {assignGrade.map((grade, index) => (
              <option key={index} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedClass || sections.length === 0}
          >
            <option value="">All Sections</option>
            {sections.map((section, index) => (
              <option key={index} value={section}>
                Section {section}
              </option>
            ))}
          </select>
          {selectedClass && sections.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">No sections found for this class</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedClass}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Type
          </label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="midterm">Midterm</option>
            <option value="final">Final</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>
      </div>

      {/* Class & Section Info */}
      {(selectedClass || selectedSection) && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            {selectedClass && (
              <div>
                <span className="font-medium">Class:</span> {selectedClass}
              </div>
            )}
            {selectedSection && (
              <div>
                <span className="font-medium">Section:</span> {selectedSection}
              </div>
            )}
            <div>
              <span className="font-medium">Students:</span> {filteredStudents.length}
            </div>
          </div>
        </div>
      )}

      {/* Subject Info */}
      {currentSubject && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Subject Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Full Marks:</span> {currentSubject.fullMark}
            </div>
            <div>
              <span className="font-medium">Pass Marks:</span> {currentSubject.passMark}
            </div>
            {currentSubject.practicalfullMarks && (
              <>
                <div>
                  <span className="font-medium">Practical Full:</span> {currentSubject.practicalfullMarks}
                </div>
                <div>
                  <span className="font-medium">Practical Pass:</span> {currentSubject.practicalpassMarks}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Marks Entry Table */}
      {filteredStudents.length > 0 && selectedSubject && (
        <div className="overflow-x-auto">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Students List ({filteredStudents.length} students)
            </h3>
            <div className="text-sm text-gray-600">
              Section: {selectedSection || "All Sections"}
            </div>
          </div>
          
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left font-medium text-gray-700">Roll No.</th>
                <th className="py-3 px-4 border-b text-left font-medium text-gray-700">Student Name</th>
                <th className="py-3 px-4 border-b text-left font-medium text-gray-700">Section</th>
                <th className="py-3 px-4 border-b text-center font-medium text-gray-700">
                  Theory Marks ({currentSubject?.fullMark})
                </th>
                {currentSubject?.practicalfullMarks && (
                  <th className="py-3 px-4 border-b text-center font-medium text-gray-700">
                    Practical Marks ({currentSubject.practicalfullMarks})
                  </th>
                )}
                <th className="py-3 px-4 border-b text-center font-medium text-gray-700">Total</th>
                <th className="py-3 px-4 border-b text-center font-medium text-gray-700">Grade</th>
                <th className="py-3 px-4 border-b text-center font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => {
                const studentMarks = marksData.find(m => m.studentId === student._id);
                return (
                  <tr key={student._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 border-b">{student.rollNumber}</td>
                    <td className="py-3 px-4 border-b">{student.firstName} {student.lastName}</td>
                    <td className="py-3 px-4 border-b">{student.section}</td>
                    <td className="py-3 px-4 border-b">
                      <input
                        type="number"
                        min="0"
                        max={currentSubject?.fullMark}
                        value={studentMarks?.theoryMarks || 0}
                        onChange={(e) => handleMarksChange(student._id, 'theoryMarks', e.target.value)}
                        className="w-20 p-1 border border-gray-300 rounded text-center"
                      />
                    </td>
                    {currentSubject?.practicalfullMarks && (
                      <td className="py-3 px-4 border-b">
                        <input
                          type="number"
                          min="0"
                          max={currentSubject.practicalfullMarks}
                          value={studentMarks?.practicalMarks || 0}
                          onChange={(e) => handleMarksChange(student._id, 'practicalMarks', e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded text-center"
                        />
                      </td>
                    )}
                    <td className="py-3 px-4 border-b text-center font-medium">
                      {studentMarks?.totalMarks || 0}
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <span className={`font-medium ${
                        studentMarks?.grade === 'F' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {studentMarks?.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        studentMarks?.status === 'pass' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {studentMarks?.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Submit Button */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total students in this section: {filteredStudents.length}
            </div>
            <button
              onClick={handleSubmitMarks}
              disabled={isSubmitting || !selectedClass || !selectedSubject}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Marks'}
            </button>
          </div>
        </div>
      )}

      {/* Empty States */}
      {!selectedClass && (
        <div className="text-center py-8 text-gray-500">
          Please select a class to start entering marks.
        </div>
      )}

      {selectedClass && !selectedSubject && (
        <div className="text-center py-8 text-gray-500">
          Please select a subject to start entering marks.
        </div>
      )}

      {selectedClass && selectedSubject && filteredStudents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No students found for the selected class{selectedSection ? ` and section ${selectedSection}` : ''}.
        </div>
      )}
    </div>
  );
}