import React, { useEffect, useState } from "react";

import TaskSuggestionCard from "./taskCard";

interface AssemblyActivity {
  _id?: string;
  studentId: string;
  studentName?: string;
  month: string;
  year: number;
  activities: {
    conduction: boolean;
    newsReading: boolean;
    talentShow: boolean;
    speech: boolean;
  };
  dateAssigned: string;
  completed: boolean;
  remarks?: string;
  performanceRating?: number;
  feedback?: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  Class: number | string;
  section: string;
  rollNumber: string;
  house: string;
}

export default function AssemblyActivities() {
  const [assemblyActivities, setAssemblyActivities] = useState<AssemblyActivity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("activityType");

  // Fetch all students
  const fetchAllStudents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/students/getStudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
      }
    } catch (error) {
      console.log("Error fetching students:", error);
      setStudents([]);
    }
  }

  // Fetch assembly activities
  const fetchAssemblyActivities = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/assembly', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssemblyActivities(data.data || []);
      }
    } catch (error) {
      console.log("Error fetching activities:", error);
      setAssemblyActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Get student name by ID
  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s._id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
  };

  // Get student class info
  const getStudentClass = (studentId: string): string => {
    const student = students.find(s => s._id === studentId);
    return student ? `${student.Class}` : "";
  };

  // Get student section
  const getStudentSection = (studentId: string): string => {
    const student = students.find(s => s._id === studentId);
    return student ? student.section : "";
  };

  // Get completed activities count
  const getCompletedCount = (activities: any): number => {
    return Object.values(activities).filter((activity: any) => activity).length;
  };

  // Get total activities count
  const getTotalActivities = (activities: any): number => {
    return Object.values(activities).length;
  };

  // Get completion percentage
  const getCompletionPercentage = (activities: any): number => {
    const completed = getCompletedCount(activities);
    const total = getTotalActivities(activities);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Get primary activity type for grouping
  const getPrimaryActivityType = (activities: any): string => {
    if (activities.conduction) return "conduction";
    if (activities.speech) return "speech";
    if (activities.newsReading) return "newsReading";
    if (activities.talentShow) return "talentShow";
    return "none";
  };

  // Get activity type label
  const getActivityTypeLabel = (activityType: string): string => {
    switch (activityType) {
      case "conduction": return "Conduction";
      case "speech": return "Speech";
      case "newsReading": return "News Reading";
      case "talentShow": return "Talent Show";
      default: return "No Activity";
    }
  };

  // Get unique values for filters
  const uniqueMonths = [...new Set(assemblyActivities.map(activity => activity.month))].sort();
  const uniqueYears = [...new Set(assemblyActivities.map(activity => activity.year.toString()))].sort((a, b) => parseInt(b) - parseInt(a));
  
  // Filter and sort activities
  const filteredActivities = assemblyActivities
    .filter(activity => {
      const matchesMonth = !filterMonth || activity.month === filterMonth;
      const matchesYear = !filterYear || activity.year.toString() === filterYear;
      const matchesStatus = !filterStatus || 
        (filterStatus === 'completed' && activity.completed) ||
        (filterStatus === 'pending' && !activity.completed);
      
      return matchesMonth && matchesYear && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "activityType":
          // Group by activity type
          const typeA = getPrimaryActivityType(a.activities);
          const typeB = getPrimaryActivityType(b.activities);
          
          if (typeA !== typeB) {
            return typeA.localeCompare(typeB);
          }
          break;
          
        case "conduction":
          if (a.activities.conduction && !b.activities.conduction) return -1;
          if (!a.activities.conduction && b.activities.conduction) return 1;
          break;
          
        case "speech":
          if (a.activities.speech && !b.activities.speech) return -1;
          if (!a.activities.speech && b.activities.speech) return 1;
          break;
          
        case "newsReading":
          if (a.activities.newsReading && !b.activities.newsReading) return -1;
          if (!a.activities.newsReading && b.activities.newsReading) return 1;
          break;
          
        case "talentShow":
          if (a.activities.talentShow && !b.activities.talentShow) return -1;
          if (!a.activities.talentShow && b.activities.talentShow) return 1;
          break;
          
        case "completion":
          if (a.completed && !b.completed) return -1;
          if (!a.completed && b.completed) return 1;
          break;
          
        case "rating":
          const ratingA = a.performanceRating || 0;
          const ratingB = b.performanceRating || 0;
          return ratingB - ratingA;
          
        case "progress":
          const progressA = getCompletionPercentage(a.activities);
          const progressB = getCompletionPercentage(b.activities);
          return progressB - progressA;
          
        default:
          break;
      }
      
      // Default secondary sort by student name
      const studentA = students.find(s => s._id === a.studentId);
      const studentB = students.find(s => s._id === b.studentId);
      const nameA = studentA ? `${studentA.firstName} ${studentA.lastName}`.toLowerCase() : '';
      const nameB = studentB ? `${studentB.firstName} ${studentB.lastName}`.toLowerCase() : '';
      
      return nameA.localeCompare(nameB);
    });

  // Group activities by type for display
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const activityType = getPrimaryActivityType(activity.activities);
    if (!groups[activityType]) {
      groups[activityType] = [];
    }
    groups[activityType].push(activity);
    return groups;
  }, {} as Record<string, AssemblyActivity[]>);

  // Get status badge
  const getStatusBadge = (completed: boolean) => {
    return completed ? 
      <span className="status-badge completed">Completed</span> : 
      <span className="status-badge pending">Pending</span>;
  };

  // Get activity status icons with better styling
  const getActivityStatus = (activities: any) => {
    return (
      <div className="activity-status">
       {activities.conduction && <span className={`activity-icon ${activities.conduction ? 'completed' : 'pending'}`} title="Conduction">
          Conduction
        </span> }
      { activities.newsReading &&  <span className={`activity-icon ${activities.newsReading ? 'completed' : 'pending'}`} title="News Reading">
          News Reading
        </span> }
        { activities.talentShow &&
        <span className={`activity-icon ${activities.talentShow ? 'completed' : 'pending'}`} title="Talent Show">
          Talent Show
        </span>}
        {
          activities.speech &&
        
        <span className={`activity-icon ${activities.speech ? 'completed' : 'pending'}`} title="Speech">
          
          Speech
        </span>}
      </div>
    );
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAllStudents();
      await fetchAssemblyActivities();
    };
    loadData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    fetchAllStudents();
    fetchAssemblyActivities();
  };

  const clearFilters = () => {
    setFilterMonth("");
    setFilterYear("");
    setFilterStatus("");
    setSortBy("activityType");
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading assembly activities...</p>
      </div>
    );
  }

  return (
    <div className="assembly-activities">
      <div className="header">
        <h1>Assembly Activities</h1>
        <p>Student Tasks and Participation Overview</p>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Month:</label>
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {uniqueMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Year:</label>
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="activityType">Activity Type</option>
            <option value="conduction">Conduction</option>
            <option value="speech">Speech</option>
            <option value="newsReading">News Reading</option>
            <option value="talentShow">Talent Show</option>
            <option value="completion">Completion Status</option>
            <option value="rating">Performance Rating</option>
            <option value="progress">Progress</option>
            <option value="name">Student Name</option>
          </select>
        </div>

        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-btn">
            Clear Filters
          </button>
          <button onClick={refreshData} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-number">{filteredActivities.length}</span>
          <span className="stat-label">Total Activities</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredActivities.filter(a => a.completed).length}
          </span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredActivities.filter(a => !a.completed).length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredActivities.length > 0 
              ? Math.round((filteredActivities.filter(a => a.completed).length / filteredActivities.length) * 100)
              : 0
            }%
          </span>
          <span className="stat-label">Completion Rate</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="activities-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Month/Year</th>
              <th>Activities</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedActivities).map(([activityType, activities]) => (
              <React.Fragment key={activityType}>
                {/* Group Header */}
                <tr className="group-header">
                  <td colSpan={8}>
                    <div className="group-title">
                      <span className="group-icon">
                        {activityType === "conduction" && "🎤"}
                        {activityType === "speech" && "🗣️"}
                        {activityType === "newsReading" && "📰"}
                        {activityType === "talentShow" && "💃"}
                        {activityType === "none" && "📝"}
                      </span>
                      {getActivityTypeLabel(activityType)} Activities
                      <span className="group-count">({activities.length} students)</span>
                    </div>
                  </td>
                </tr>
                
                {/* Activities in this group */}
                {activities.map((activity) => {
                  const student = students.find(s => s._id === activity.studentId);
                  const completionPercent = getCompletionPercentage(activity.activities);
                  
                  return (
                    <tr key={activity._id}>
                      <td className="student-name">
                        <strong>{getStudentName(activity.studentId)}</strong>
                        {student && <div className="roll-number">Roll: {student.rollNumber}</div>}
                      </td>
                      <td className="class-info">
                        {getStudentClass(activity.studentId)} - {getStudentSection(activity.studentId)}
                      </td>
                      <td className="date-info">
                        {activity.month} {activity.year}
                      </td>
                      <td className="activities">
                        {getActivityStatus(activity.activities)}
                        <div className="activity-details">
                          {getCompletedCount(activity.activities)}/4 completed
                        </div>
                      </td>
                      <td className="progress-cell">
                        <div className="progress-info">
                          <div className="progress-text">{completionPercent}%</div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${completionPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(activity.completed)}
                      </td>
                      <td className="rating">
                        {activity.performanceRating ? (
                          <>
                            <div className="stars">
                              {"⭐".repeat(activity.performanceRating)}
                              {"☆".repeat(5 - activity.performanceRating)}
                            </div>
                            <div className="rating-text">({activity.performanceRating}/5)</div>
                          </>
                        ) : (
                          <span className="no-rating">Not Rated</span>
                        )}
                      </td>
                      <td className="feedback">
                        {activity.feedback ? (
                          <div className="feedback-text" title={activity.feedback}>
                            "{activity.feedback.length > 50 
                              ? activity.feedback.substring(0, 50) + '...' 
                              : activity.feedback
                            }"
                          </div>
                        ) : (
                          <span className="no-feedback">No feedback</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredActivities.length === 0 && (
          <div className="no-data">
            <p>No activities found matching your filters.</p>
            <button onClick={clearFilters}>Clear all filters</button>
          </div>
        )}
      </div>
      <TaskSuggestionCard />

      <style>{`
        .assembly-activities {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .header p {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .loading {
          text-align: center;
          padding: 50px;
          color: #7f8c8d;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Filters Section */
        .filters-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .filter-group label {
          font-weight: bold;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .filter-group select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background: white;
        }

        .filter-actions {
          display: flex;
          gap: 10px;
          align-items: end;
        }

        .clear-btn, .refresh-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .clear-btn {
          background: #95a5a6;
          color: white;
        }

        .refresh-btn {
          background: #3498db;
          color: white;
        }

        .clear-btn:hover {
          background: #7f8c8d;
        }

        .refresh-btn:hover {
          background: #2980b9;
        }

        /* Statistics */
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          border-left: 4px solid #3498db;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .stat-label {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        /* Table */
        .table-container {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .activities-table {
          width: 100%;
          border-collapse: collapse;
        }

        .activities-table th {
          background: #34495e;
          color: white;
          padding: 12px 15px;
          text-align: left;
          font-weight: bold;
        }

        .activities-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #ecf0f1;
        }

        .activities-table tr:hover {
          background: #f8f9fa;
        }

        /* Group Header */
        .group-header {
          background: #2c3e50 !important;
        }

        .group-header td {
          padding: 8px 15px;
          border-bottom: 2px solid #34495e;
        }

        .group-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .group-icon {
          font-size: 1.3rem;
        }

        .group-count {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-left: auto;
          background: rgba(255,255,255,0.2);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .student-name strong {
          color: #2c3e50;
        }

        .roll-number {
          font-size: 0.8rem;
          color: #7f8c8d;
          margin-top: 2px;
        }

        .class-info {
          color: #7f8c8d;
          font-weight: 500;
        }

        .date-info {
          color: #7f8c8d;
        }

        .activity-status {
          display: flex;
          gap: 8px;
          margin-bottom: 5px;
        }

        .activity-icon {
          font-size: 1.2rem;
          opacity: 0.4;
          transition: opacity 0.3s ease;
        }

        .activity-icon.completed {
          opacity: 1;
        }

        .activity-details {
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .progress-cell {
          min-width: 120px;
        }

        .progress-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .progress-text {
          font-size: 0.8rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #ecf0f1;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3498db;
          transition: width 0.3s ease;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-badge.completed {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }

        .rating {
          text-align: center;
        }

        .stars {
          font-size: 0.9rem;
          margin-bottom: 2px;
        }

        .rating-text {
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .no-rating {
          color: #95a5a6;
          font-style: italic;
          font-size: 0.9rem;
        }

        .feedback-text {
          font-size: 0.9rem;
          color: #495057;
          font-style: italic;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .no-feedback {
          color: #95a5a6;
          font-style: italic;
          font-size: 0.9rem;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
        }

        .no-data button {
          margin-top: 10px;
          padding: 8px 16px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .assembly-activities {
            padding: 10px;
          }

          .filters-section {
            grid-template-columns: 1fr;
          }

          .filter-actions {
            justify-content: center;
          }

          .table-container {
            overflow-x: auto;
          }

          .activities-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
}