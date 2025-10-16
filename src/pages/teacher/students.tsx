import { useState, useEffect, useRef } from "react";

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

interface Class {
  id: string;
  name: string;
  sections: string[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

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

interface MonthlyActivity {
  month: string;
  year: number;
  activities: AssemblyActivity[];
}

interface AISuggestedActivity {
  activity: string;
  description: string;
  duration: string;
  materials: string[];
  skills: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  activityType: 'conduction' | 'newsReading' | 'talentShow' | 'speech';
  learningOutcomes: string[];
  preparationTips: string[];
  // Enhanced fields for detailed suggestions
  speechType?: string;
  speechTopics?: string[];
  talentShowFormat?: string;
  talentCategories?: string[];
  newsScript?: {
    localNews: string[];
    internationalNews: string[];
    sportsNews?: string[];
    weather?: string;
    specialSegment?: string;
  };
  executionPlan?: {
    preparationSteps: string[];
    setupRequirements: string[];
    timeline: string[];
    tipsForSuccess: string[];
  };
  recommendedStudents?: {
    studentId: string;
    reason: string;
    role: string;
  }[];
}

interface StudentParticipation {
  studentId: string;
  totalActivities: number;
  completedActivities: number;
  lastParticipation: string;
  favoriteActivity: string;
  performanceScore: number;
  activityHistory: {
    month: string;
    year: number;
    activityType: string;
    performanceRating?: number;
    completed: boolean;
  }[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  activityType?: string;
  suggestedActivity?: AISuggestedActivity;
}

interface AssemblySummary {
  month: string;
  year: number;
  activities: {
    conduction: string[];
    newsReading: string[];
    talentShow: string[];
    speech: string[];
  };
  timeline: string[];
  materialsNeeded: string[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function StudentsRelated() {  
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [selectedHouse, setSelectedHouse] = useState<string>("");
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedSection, setSelectedSection] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalStudents: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Assembly Activities state
    const [assemblyActivities, setAssemblyActivities] = useState<MonthlyActivity[]>([]);
    const [showAssemblySection, setShowAssemblySection] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [currentYear] = useState<number>(new Date().getFullYear());
    const [saving, setSaving] = useState(false);

    // AI Suggested Activities state
    const [aiSuggestedActivities, setAiSuggestedActivities] = useState<AISuggestedActivity[]>([]);
    const [showAIActivities, setShowAIActivities] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [selectedActivityType, setSelectedActivityType] = useState<'conduction' | 'newsReading' | 'talentShow' | 'speech' | 'all'>('all');

    // Student Participation History
    const [studentParticipation, setStudentParticipation] = useState<{[key: string]: StudentParticipation}>({});
    const [showParticipationHistory, setShowParticipationHistory] = useState<string | null>(null);

    // AI Chat state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [userMessage, setUserMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatActive, setChatActive] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Assembly Summary state
    const [assemblySummary, setAssemblySummary] = useState<AssemblySummary | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        fetchAllStudents();
        fetchClasses();
        fetchExistingAssemblyActivities();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [selectedHouse, selectedClass, selectedSection, students]);

    useEffect(() => {
        updatePagination();
    }, [filteredStudents, currentPage, itemsPerPage]);

    useEffect(() => {
        // Initialize selected month to current month
        const currentMonth = MONTHS[new Date().getMonth()];
        setSelectedMonth(currentMonth);
    }, []);

    // Auto-update assembly activities when students are selected/deselected
    useEffect(() => {
        if (showAssemblySection && selectedStudents.length > 0) {
            updateAssemblyActivitiesForSelectedStudents();
        }
    }, [selectedStudents, showAssemblySection]);

    // Update participation history when assembly activities change
    useEffect(() => {
        updateStudentParticipationHistory();
    }, [assemblyActivities]);

    // Scroll to bottom of chat when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // Generate assembly summary when activities change
    useEffect(() => {
        if (showAssemblySection) {
            generateAssemblySummary();
        }
    }, [assemblyActivities, selectedMonth]);

    const fetchAllStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/students/getStudent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setStudents(data.data || []);
        } catch (error) {
            console.log("Error fetching all students:", error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }

    const fetchClasses = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/class-sections', {
                method: 'GET',  
                headers: {
                    'Content-Type': 'application/json',
                }
            }); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setClasses(data.data || []);
        } catch (error) {
            console.log("Error fetching classes:", error);
            setClasses([]);
        }
    }

    const fetchExistingAssemblyActivities = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/assembly', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched existing assembly activities:", data);
                // Transform the data to match our structure
                if (data.data && data.data.length > 0) {
                    const monthlyActivities = organizeActivitiesByMonth(data.data);
                    setAssemblyActivities(monthlyActivities);
                }
            }
        } catch (error) {
            console.log("Error fetching existing assembly activities:", error);
        }
    }

    const organizeActivitiesByMonth = (activities: AssemblyActivity[]): MonthlyActivity[] => {
        const monthlyMap: { [key: string]: AssemblyActivity[] } = {};
        
        activities.forEach(activity => {
            const key = `${activity.month}-${activity.year}`;
            if (!monthlyMap[key]) {
                monthlyMap[key] = [];
            }
            monthlyMap[key].push(activity);
        });

        return Object.entries(monthlyMap).map(([key, activities]) => {
            const [month, year] = key.split('-');
            return {
                month,
                year: parseInt(year),
                activities
            };
        });
    }

    const updateStudentParticipationHistory = () => {
        const participation: {[key: string]: StudentParticipation} = {};
        
        assemblyActivities.forEach(monthlyActivity => {
            monthlyActivity.activities.forEach(activity => {
                if (!participation[activity.studentId]) {
                     participation[activity.studentId] = {
                        studentId: activity.studentId,
                        totalActivities: 0,
                        completedActivities: 0,
                        lastParticipation: '',
                        favoriteActivity: '',
                        performanceScore: 0,
                        activityHistory: []
                    };
                }

                // Count activities
                Object.entries(activity.activities).forEach(([type, assigned]) => {
                    if (assigned) {
                        participation[activity.studentId].totalActivities++;
                        if (activity.completed) {
                            participation[activity.studentId].completedActivities++;
                        }
                        
                        // Add to history
                        participation[activity.studentId].activityHistory.push({
                            month: activity.month,
                            year: activity.year,
                            activityType: type,
                            performanceRating: activity.performanceRating,
                            completed: activity.completed
                        });

                        // Update last participation
                        const activityDate = `${activity.month} ${activity.year}`;
                        if (!participation[activity.studentId].lastParticipation || 
                            new Date(activityDate) > new Date(participation[activity.studentId].lastParticipation)) {
                            participation[activity.studentId].lastParticipation = activityDate;
                        }

                        // Calculate performance score
                        if (activity.performanceRating) {
                            participation[activity.studentId].performanceScore = 
                                (participation[activity.studentId].performanceScore + activity.performanceRating) / 2;
                        }
                    }
                });
            });
        });

        // Calculate favorite activity for each student
        Object.keys(participation).forEach(studentId => {
            const activityCounts: {[key: string]: number} = {};
            participation[studentId].activityHistory.forEach(history => {
                activityCounts[history.activityType] = (activityCounts[history.activityType] || 0) + 1;
            });
            
            const favorite = Object.entries(activityCounts).reduce((max, [activity, count]) => 
                count > (activityCounts[max] || 0) ? activity : max, 'conduction'
            );
            
            participation[studentId].favoriteActivity = favorite;
        });

        setStudentParticipation(participation);
    };

    const getStudentParticipationInfo = (studentId: string) => {
        return studentParticipation[studentId] || {
            studentId,
            totalActivities: 0,
            completedActivities: 0,
            lastParticipation: 'Never',
            favoriteActivity: 'None',
            performanceScore: 0,
            activityHistory: []
        };
    };

    const hasStudentParticipatedInActivity = (studentId: string, activityType: string, month: string, year: number) => {
        const participation = getStudentParticipationInfo(studentId);
        return participation.activityHistory.some(history => 
            history.activityType === activityType && 
            history.month === month && 
            history.year === year
        );
    };

    const getActivityTypeDisplayName = (type: string) => {
        const names = {
            conduction: "Assembly Conduction",
            newsReading: "News Reading",
            talentShow: "Talent Show",
            speech: "Speech Delivery"
        };
        return names[type as keyof typeof names] || type;
    };

    const applyFilters = () => {
        let filtered = [...students];

        // Filter by house
        if (selectedHouse) {
            filtered = filtered.filter(student => 
                student.house?.toLowerCase() === selectedHouse.toLowerCase()
            );
        }

        // Filter by class
        if (selectedClass) {
            filtered = filtered.filter(student => 
                student.Class?.toString() === selectedClass
            );
        }

        // Filter by section
        if (selectedSection) {
            filtered = filtered.filter(student => 
                student.section?.toLowerCase() === selectedSection.toLowerCase()
            );
        }

        setFilteredStudents(filtered);
        setCurrentPage(1);
    }

    const updatePagination = () => {
        const totalStudents = filteredStudents.length;
        const totalPages = Math.ceil(totalStudents / itemsPerPage);
        
        setPaginationInfo({
            currentPage,
            totalPages,
            totalStudents,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1
        });
    }

    const getCurrentPageStudents = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredStudents.slice(startIndex, endIndex);
    }

    const handleStudentSelection = (studentId: string) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentPageStudents = getCurrentPageStudents();
        if (e.target.checked) {
            const currentPageIds = currentPageStudents.map(student => student._id);
            setSelectedStudents(prev => [...new Set([...prev, ...currentPageIds])]);
        } else {
            const currentPageIds = currentPageStudents.map(student => student._id);
            setSelectedStudents(prev => prev.filter(id => !currentPageIds.includes(id)));
        }
    }

    const getSectionsForSelectedClass = () => {
        const selectedClassObj = classes.find(cls => cls.name === selectedClass);
        return selectedClassObj?.sections || [];
    }

    const clearFilters = () => {
        setSelectedHouse("");
        setSelectedClass("");
        setSelectedSection("");
        setSelectedStudents([]);
        setCurrentPage(1);
        setShowAssemblySection(false);
        setShowAIActivities(false);
        setShowParticipationHistory(null);
        setChatActive(false);
        setChatMessages([]);
        setShowSummary(false);
    }

    const goToPage = (page: number) => {
        setCurrentPage(page);
    }

    const goToNextPage = () => {
        if (paginationInfo.hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    }

    const goToPrevPage = () => {
        if (paginationInfo.hasPrevPage) {
            setCurrentPage(prev => prev - 1);
        }
    }

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    }

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(paginationInfo.totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    }

    const updateAssemblyActivitiesForSelectedStudents = () => {
        setAssemblyActivities(prev => 
            prev.map(monthlyActivity => ({
                ...monthlyActivity,
                activities: monthlyActivity.activities.filter(activity => 
                    selectedStudents.includes(activity.studentId)
                ).concat(
                    selectedStudents
                        .filter(studentId => 
                            !monthlyActivity.activities.some(activity => 
                                activity.studentId === studentId
                            )
                        )
                        .map(studentId => ({
                            studentId,
                            month: monthlyActivity.month,
                            year: monthlyActivity.year,
                            activities: {
                                conduction: false,
                                newsReading: false,
                                talentShow: false,
                                speech: false
                            },
                            dateAssigned: new Date().toISOString().split('T')[0],
                            completed: false
                        }))
                )
            }))
        );
    };

    const initializeAssemblyActivities = () => {
        const monthlyActivities: MonthlyActivity[] = MONTHS.map(month => ({
            month,
            year: currentYear,
            activities: selectedStudents.map(studentId => {
                // Check if activity already exists
                const existingActivity = assemblyActivities
                    .find(ma => ma.month === month && ma.year === currentYear)
                    ?.activities.find(a => a.studentId === studentId);
                
                return existingActivity || {
                    studentId,
                    month,
                    year: currentYear,
                    activities: {
                        conduction: false,
                        newsReading: false,
                        talentShow: false,
                        speech: false
                    },
                    dateAssigned: new Date().toISOString().split('T')[0],
                    completed: false
                };
            })
        }));
        setAssemblyActivities(monthlyActivities);
        setShowAssemblySection(true);
    };

    const handleAssemblyActivityChange = (
        studentId: string, 
        month: string, 
        activity: keyof AssemblyActivity['activities'], 
        value: boolean
    ) => {
        // Check if student already participated in this activity
        if (value && hasStudentParticipatedInActivity(studentId, activity, month, currentYear)) {
            if (!confirm('This student has already participated in this activity type. Are you sure you want to assign it again?')) {
                return;
            }
        }

        setAssemblyActivities(prev => 
            prev.map(monthlyActivity => 
                monthlyActivity.month === month && monthlyActivity.year === currentYear
                    ? {
                          ...monthlyActivity,
                          activities: monthlyActivity.activities.map(activityItem =>
                              activityItem.studentId === studentId
                                  ? {
                                        ...activityItem,
                                        activities: {
                                            ...activityItem.activities,
                                            [activity]: value
                                        }
                                    }
                                  : activityItem
                          )
                      }
                    : monthlyActivity
            )
        );
    };

    const handleActivityCompletion = (studentId: string, month: string, completed: boolean, rating?: number) => {
        setAssemblyActivities(prev => 
            prev.map(monthlyActivity => 
                monthlyActivity.month === month && monthlyActivity.year === currentYear
                    ? {
                          ...monthlyActivity,
                          activities: monthlyActivity.activities.map(activityItem =>
                              activityItem.studentId === studentId
                                  ? {
                                        ...activityItem,
                                        completed,
                                        performanceRating: rating || activityItem.performanceRating
                                    }
                                  : activityItem
                          )
                      }
                    : monthlyActivity
            )
        );
    };

    const getStudentById = (studentId: string) => {
        return students.find(student => student._id === studentId);
    };

    const getActivitiesForSelectedMonth = () => {
        return assemblyActivities.find(activity => 
            activity.month === selectedMonth && activity.year === currentYear
        )?.activities || [];
    };

    const getActivitySummary = (month: string) => {
        const monthlyActivity = assemblyActivities.find(activity => 
            activity.month === month && activity.year === currentYear
        );
        if (!monthlyActivity) return { total: 0, assigned: 0, completed: 0 };
        
        const total = monthlyActivity.activities.length;
        const assigned = monthlyActivity.activities.filter(activity => 
            Object.values(activity.activities).some(value => value)
        ).length;
        const completed = monthlyActivity.activities.filter(activity => 
            activity.completed
        ).length;
        
        return { total, assigned, completed };
    };

    const saveAssemblyActivitiesToDatabase = async (activities: AssemblyActivity[]) => {
        setSaving(true);
        try {
            console.log('📤 Sending assembly activities to server:');
    console.log('Number of activities:', activities.length);
    console.log('First activity sample:', activities[0]);
    console.log('Full activities data:', JSON.stringify(activities, null, 2));
    
            const response = await fetch('http://localhost:8000/api/assembly/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ activities })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error saving assembly activities:", error);
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const submitAssemblyActivities = async () => {
        try {
            // Flatten all activities from all months
            const allActivities = assemblyActivities.flatMap(monthly => monthly.activities);
            console.log("Submitting activities:", allActivities);
            await saveAssemblyActivitiesToDatabase(allActivities);
            
            alert('Assembly activities saved successfully!');
            setShowAssemblySection(false);
            setSelectedStudents([]);
        } catch (error) {
            alert('Error saving assembly activities. Please try again.');
        }
    };

    const submitSingleMonthActivities = async () => {
        try {
            const monthlyActivities = assemblyActivities.find(activity => 
                activity.month === selectedMonth && activity.year === currentYear
            );
            
            if (monthlyActivities) {
                await saveAssemblyActivitiesToDatabase(monthlyActivities.activities);
                alert(`Assembly activities for ${selectedMonth} saved successfully!`);
            }
        } catch (error) {
            alert('Error saving assembly activities. Please try again.');
        }
    };

    // Generate Assembly Summary
    const generateAssemblySummary = () => {
        const currentMonthActivities = getActivitiesForSelectedMonth();
        const summary: AssemblySummary = {
            month: selectedMonth,
            year: currentYear,
            activities: {
                conduction: [],
                newsReading: [],
                talentShow: [],
                speech: []
            },
            timeline: [],
            materialsNeeded: []
        };

        // Collect assigned students for each activity type
        currentMonthActivities.forEach(activity => {
            const student = getStudentById(activity.studentId);
            if (!student) return;

            Object.entries(activity.activities).forEach(([type, assigned]) => {
                if (assigned) {
                    const studentInfo = `${student.firstName} ${student.lastName} (Class ${student.Class}${student.section})`;
                    summary.activities[type as keyof typeof summary.activities].push(studentInfo);
                }
            });
        });

        // Generate timeline based on activities
        const timeline = [];
        if (summary.activities.conduction.length > 0) timeline.push("8:00 AM - Assembly Conduction");
        if (summary.activities.newsReading.length > 0) timeline.push("8:10 AM - News Reading");
        if (summary.activities.speech.length > 0) timeline.push("8:20 AM - Speech Delivery");
        if (summary.activities.talentShow.length > 0) timeline.push("8:30 AM - Talent Show");
        timeline.push("8:45 AM - National Anthem & Dismissal");
        summary.timeline = timeline;

        // Generate materials needed
        const materials = new Set<string>();
        if (summary.activities.conduction.length > 0) {
            materials.add("Microphone");
            materials.add("Assembly agenda printouts");
        }
        if (summary.activities.newsReading.length > 0) {
            materials.add("News scripts");
            materials.add("Projector for news headlines");
        }
        if (summary.activities.speech.length > 0) {
            materials.add("Podium");
            materials.add("Speech notes");
        }
        if (summary.activities.talentShow.length > 0) {
            materials.add("Performance props");
            materials.add("Music system");
            materials.add("Stage decorations");
        }
        summary.materialsNeeded = Array.from(materials);

        setAssemblySummary(summary);
    };

    // AI Chat Functions
    const sendChatMessage = async () => {
        if (!userMessage.trim() || isChatLoading) return;

        const userMessageObj: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: userMessage,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessageObj]);
        setUserMessage('');
        setIsChatLoading(true);

        try {
            // Get context for AI
            const context = {
                selectedStudents: selectedStudents.map(id => {
                    const student = getStudentById(id);
                    const participation = getStudentParticipationInfo(id);
                    return {
                        id,
                        name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
                        class: student?.Class,
                        section: student?.section,
                        hobbies: student?.hobbies,
                        achievements: student?.achievements,
                        participation: {
                            totalActivities: participation.totalActivities,
                            favoriteActivity: participation.favoriteActivity,
                            performanceScore: participation.performanceScore
                        }
                    };
                }),
                selectedMonth,
                activityType: selectedActivityType,
                currentActivities: aiSuggestedActivities
            };

            const requestBody = {
                message: userMessage,
                context: context,
                currentActivities: aiSuggestedActivities,
                selectedActivityType: selectedActivityType
            };

            console.log("Sending chat request:", requestBody);

            const response = await fetch('http://localhost:8000/api/chat/chatActivity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Chat response:", data);
            
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: data.response || "I apologize, but I couldn't generate a response.",
                timestamp: new Date(),
                suggestedActivity: data.suggestedActivity
            };

            setChatMessages(prev => [...prev, aiMessage]);

            // If AI suggests a new activity, update the suggestions
            if (data.suggestedActivity) {
                setAiSuggestedActivities(prev => {
                    const updated = [...prev];
                    const existingIndex = updated.findIndex(activity => 
                        activity.activityType === data.suggestedActivity.activityType
                    );
                    
                    if (existingIndex >= 0) {
                        updated[existingIndex] = data.suggestedActivity;
                    } else {
                        updated.push(data.suggestedActivity);
                    }
                    
                    return updated;
                });
            }

            // Handle multiple activities
            if (data.suggestedActivities && data.suggestedActivities.length > 0) {
                setAiSuggestedActivities(data.suggestedActivities);
            }

        } catch (error: any) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: `Error: ${error.message || "I apologize, but I'm having trouble responding right now. Please try again shortly."}`,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const updateActivityWithAI = async (activity: AISuggestedActivity, improvementRequest: string) => {
        setIsChatLoading(true);
        
        try {
            const requestBody = {
                message: `Improve this ${activity.activityType} activity: "${activity.activity}". ${improvementRequest}. Please provide an enhanced version with better details, execution plan, and student recommendations.`,
                context: {
                    selectedStudents: selectedStudents.map(id => {
                        const student = getStudentById(id);
                        return {
                            id,
                            name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
                            class: student?.Class,
                            hobbies: student?.hobbies
                        };
                    }),
                    selectedMonth,
                    currentActivity: activity
                },
                currentActivities: [activity],
                selectedActivityType: activity.activityType
            };

            const response = await fetch('http://localhost:8000/api/chat/chatActivity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.suggestedActivity) {
                setAiSuggestedActivities(prev => 
                    prev.map(a => 
                        a.activityType === activity.activityType ? data.suggestedActivity : a
                    )
                );
                
                // Add to chat history
                const aiMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'ai',
                    content: `I've updated the ${getActivityTypeDisplayName(activity.activityType)} activity based on your feedback!`,
                    timestamp: new Date(),
                    suggestedActivity: data.suggestedActivity
                };
                
                setChatMessages(prev => [...prev, aiMessage]);
            } else {
                // If no structured activity returned, just show the response
                const aiMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'ai',
                    content: data.response || "I've processed your improvement request.",
                    timestamp: new Date()
                };
                setChatMessages(prev => [...prev, aiMessage]);
            }

        } catch (error: any) {
            console.error("Activity update error:", error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: `Error: ${error.message || "Failed to update activity. Please try again."}`,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const generateAIActivities = async (activityType: 'conduction' | 'newsReading' | 'talentShow' | 'speech' | 'all' = 'all') => {
        setAiLoading(true);
        setSelectedActivityType(activityType);
        
        try {
            // Get detailed student information for AI context
            const studentContext = selectedStudents.map(studentId => {
                const student = getStudentById(studentId);
                const participation = getStudentParticipationInfo(studentId);
                return {
                    id: studentId,
                    name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
                    class: student?.Class,
                    section: student?.section,
                    hobbies: student?.hobbies,
                    achievements: student?.achievements,
                    house: student?.house,
                    participation: {
                        totalActivities: participation.totalActivities,
                        completedActivities: participation.completedActivities,
                        favoriteActivity: participation.favoriteActivity,
                        performanceScore: participation.performanceScore,
                        lastParticipation: participation.lastParticipation
                    }
                };
            });

            const requestBody = {
                message: `Generate detailed ${activityType === 'all' ? 'all types of' : activityType} assembly activities for ${selectedStudents.length} students in ${selectedMonth}. Consider their individual profiles and participation history. Provide specific speech types, talent show formats, news scripts with local and international news, and detailed execution plans with student recommendations.`,
                context: {
                    selectedStudents: studentContext,
                    selectedMonth,
                    activityType: activityType
                },
                currentActivities: [],
                selectedActivityType: activityType
            };

            const response = await fetch('http://localhost:8000/api/chat/chatActivity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.suggestedActivities) {
                setAiSuggestedActivities(data.suggestedActivities);
            } else if (data.suggestedActivity) {
                setAiSuggestedActivities([data.suggestedActivity]);
            }

            // Add AI response to chat
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: data.response || `I've generated detailed ${activityType === 'all' ? 'all' : activityType} activity suggestions with execution plans!`,
                timestamp: new Date(),
                suggestedActivity: data.suggestedActivity
            };
            
            setChatMessages(prev => [...prev, aiMessage]);
            
        } catch (error: any) {
            console.error("AI generation failed:", error);
            
            // Add error to chat
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: `Error: ${error.message || "Failed to generate activities. Please try again."}`,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);
            
            // Generate fallback activities with enhanced details
            const fallbackActivities = activityType === 'all'
                ? [
                    generateEnhancedFallbackActivity('conduction'),
                    generateEnhancedFallbackActivity('newsReading'),
                    generateEnhancedFallbackActivity('talentShow'),
                    generateEnhancedFallbackActivity('speech')
                ]
                : [generateEnhancedFallbackActivity(activityType)];
            
            setAiSuggestedActivities(fallbackActivities);
        } finally {
            setAiLoading(false);
        }
    };

    const handleQuickQuestion = (question: string) => {
        setUserMessage(question);
    };

    const clearChat = () => {
        setChatMessages([]);
    };

    const generateEnhancedFallbackActivity = (type: 'conduction' | 'newsReading' | 'talentShow' | 'speech'): AISuggestedActivity => {
        const baseActivities = {
            conduction: {
                activity: "Interactive Morning Assembly Conduction",
                description: "Students lead a dynamic assembly with interactive segments, audience participation, and smooth transitions between activities",
                duration: "20-25 minutes",
                materials: ["Wireless microphone", "Agenda cards", "Timer", "Background music", "Visual aids"],
                skills: ["Leadership", "Time Management", "Public Speaking", "Audience Engagement"],
                learningOutcomes: ["Improved confidence in leadership", "Enhanced organizational skills", "Better communication abilities"],
                preparationTips: ["Rehearse transitions between segments", "Prepare backup activities", "Coordinate with all participants beforehand"],
                speechType: "Leadership and Coordination",
                talentShowFormat: "Not applicable",
                newsScript: {
                    localNews: ["School achievements and events", "Upcoming activities and deadlines", "Student spotlights"],
                    internationalNews: ["Major world events summary", "Cultural highlights", "Scientific discoveries"],
                    sportsNews: ["School sports updates", "Major sporting events", "Sports achievements"],
                    weather: "Current weather and forecast",
                    specialSegment: "Student of the Week announcement"
                },
                executionPlan: {
                    preparationSteps: [
                        "Meet with all participants 15 minutes before assembly",
                        "Test all equipment and microphones",
                        "Review the agenda and timing",
                        "Assign backup roles"
                    ],
                    setupRequirements: [
                        "Stage preparation",
                        "Sound system check",
                        "Visual aids setup",
                        "Seating arrangement"
                    ],
                    timeline: [
                        "7:55 AM - Final preparation",
                        "8:00 AM - Welcome and introduction",
                        "8:05 AM - News reading segment",
                        "8:15 AM - Speech delivery",
                        "8:25 AM - Talent show performances",
                        "8:40 AM - Closing remarks and announcements"
                    ],
                    tipsForSuccess: [
                        "Maintain eye contact with audience",
                        "Use clear and confident voice",
                        "Keep transitions smooth and timely",
                        "Engage the audience with questions"
                    ]
                },
                recommendedStudents: selectedStudents.slice(0, 2).map(id => {
                     return {
                        studentId: id,
                        reason: "Shows leadership potential and good communication skills",
                        role: "Assembly Conductor"
                    };
                })
            },
            newsReading: {
                activity: "Comprehensive News Bulletin Presentation",
                description: "Students present a well-researched news bulletin covering local, international, sports news with interactive segments",
                duration: "15-20 minutes",
                materials: ["News scripts", "Projector for headlines", "Maps and charts", "Q&A cards", "Current newspapers"],
                skills: ["Research", "Presentation", "Critical Thinking", "Current Affairs Knowledge"],
                learningOutcomes: ["Enhanced awareness of current events", "Improved research skills", "Better public speaking abilities"],
                preparationTips: ["Research diverse news sources", "Prepare visual aids", "Practice clear pronunciation", "Anticipate audience questions"],
                speechType: "Informative Presentation",
                talentShowFormat: "Not applicable",
                newsScript: {
                    localNews: [
                        "School infrastructure developments",
                        "Upcoming cultural events in the community",
                        "Local environmental initiatives",
                        "Student council updates"
                    ],
                    internationalNews: [
                        "Global political developments",
                        "International cultural festivals",
                        "Scientific breakthroughs worldwide",
                        "Environmental conservation efforts"
                    ],
                    sportsNews: [
                        "School team achievements",
                        "National sports updates",
                        "Olympic preparations",
                        "Sports personality highlights"
                    ],
                    weather: "Weekly weather forecast with seasonal tips",
                    specialSegment: "Interview with a teacher or student achiever"
                },
                executionPlan: {
                    preparationSteps: [
                        "Research and verify news sources",
                        "Prepare news scripts and visual aids",
                        "Rehearse with co-presenters",
                        "Test projection equipment"
                    ],
                    setupRequirements: [
                        "Projector and screen",
                        "News desk setup",
                        "Microphone check",
                        "Visual aid preparation"
                    ],
                    timeline: [
                        "8:10 AM - Introduction to news segment",
                        "8:12 AM - Local news presentation",
                        "8:17 AM - International news coverage",
                        "8:22 AM - Sports updates",
                        "8:26 AM - Weather and special segment",
                        "8:29 AM - Q&A session"
                    ],
                    tipsForSuccess: [
                        "Speak clearly and at moderate pace",
                        "Maintain professional demeanor",
                        "Use visual aids effectively",
                        "Engage audience with relevant questions"
                    ]
                },
                recommendedStudents: selectedStudents.slice(0, 3).map(id => {
                     return {
                        studentId: id,
                        reason: "Good research skills and clear pronunciation",
                        role: "News Presenter"
                    };
                })
            },
            talentShow: {
                activity: "Diverse Talent Exhibition Showcase",
                description: "Students showcase various talents including music, dance, drama, poetry, and unique skills in a well-organized performance sequence",
                duration: "25-30 minutes",
                materials: ["Stage area", "Music system", "Performance props", "Costumes", "Lighting effects", "Backdrop"],
                skills: ["Creativity", "Performance", "Stage Presence", "Time Management", "Collaboration"],
                learningOutcomes: ["Enhanced self-expression", "Improved stage confidence", "Better audience engagement", "Creative thinking"],
                preparationTips: ["Coordinate performance order", "Test all equipment beforehand", "Plan stage movements", "Prepare backup music"],
                speechType: "Performance Introduction",
                talentShowFormat: "Variety Show with Multiple Categories",
                talentCategories: [
                    "Musical Performance (vocal/instrumental)",
                    "Dance and Choreography",
                    "Drama and Skits",
                    "Poetry and Spoken Word",
                    "Magic and Illusions",
                    "Art and Quick Drawing"
                ],
                newsScript: {
                    localNews: ["Talent show preparations update", "Participant interviews", "Behind-the-scenes highlights"],
                    internationalNews: ["International talent competitions", "Global performing arts trends"],
                    specialSegment: "Judges introduction and criteria explanation"
                },
                executionPlan: {
                    preparationSteps: [
                        "Audition and select performances",
                        "Create performance sequence",
                        "Coordinate technical requirements",
                        "Conduct dress rehearsal"
                    ],
                    setupRequirements: [
                        "Stage decoration",
                        "Sound and lighting setup",
                        "Backstage preparation",
                        "Judges area setup"
                    ],
                    timeline: [
                        "8:30 AM - Welcome and rules explanation",
                        "8:33 AM - Musical performances",
                        "8:43 AM - Dance performances",
                        "8:53 AM - Drama and skits",
                        "9:03 AM - Special talent showcases",
                        "9:13 AM - Judges feedback and announcement"
                    ],
                    tipsForSuccess: [
                        "Keep performances within time limits",
                        "Ensure smooth transitions between acts",
                        "Maintain positive audience energy",
                        "Applaud all participants equally"
                    ]
                },
                recommendedStudents: selectedStudents.map(id => {
                    
                    const talents = ["Singing", "Dancing", "Acting", "Poetry", "Magic", "Art"];
                    const randomTalent = talents[Math.floor(Math.random() * talents.length)];
                    return {
                        studentId: id,
                        reason: `Shows interest in ${randomTalent.toLowerCase()} and has creative potential`,
                        role: "Talent Performer"
                    };
                })
            },
            speech: {
                activity: "Inspirational and Educational Speech Series",
                description: "Students deliver well-prepared speeches on motivational, educational, and contemporary topics with proper structure and delivery techniques",
                duration: "15-18 minutes",
                materials: ["Speech notes", "Podium", "Microphone", "Visual aids", "Timer", "Prompt cards"],
                skills: ["Oratory", "Content Organization", "Persuasion", "Storytelling", "Audience Analysis"],
                learningOutcomes: ["Enhanced public speaking confidence", "Improved content structuring", "Better persuasive techniques", "Effective storytelling"],
                preparationTips: ["Practice with timer", "Use vocal variety", "Incorporate personal stories", "Maintain eye contact", "Use appropriate gestures"],
                speechType: "Motivational and Educational",
                speechTopics: [
                    "The Power of Perseverance",
                    "Importance of Education in Modern World",
                    "Environmental Conservation Our Responsibility",
                    "Digital Citizenship and Online Safety",
                    "Cultural Diversity and Inclusion"
                ],
                talentShowFormat: "Not applicable",
                newsScript: {
                    localNews: ["Speech competition updates", "Student speaker highlights", "Upcoming speaking events"],
                    internationalNews: ["World leaders' speeches analysis", "Global youth speaking initiatives"],
                    specialSegment: "Speech techniques and tips segment"
                },
                executionPlan: {
                    preparationSteps: [
                        "Select speech topics",
                        "Research and outline speeches",
                        "Practice delivery with feedback",
                        "Prepare visual aids"
                    ],
                    setupRequirements: [
                        "Podium setup",
                        "Microphone testing",
                        "Timer preparation",
                        "Audience seating arrangement"
                    ],
                    timeline: [
                        "8:20 AM - Introduction to speech segment",
                        "8:22 AM - First speaker (5 minutes)",
                        "8:27 AM - Second speaker (5 minutes)",
                        "8:32 AM - Third speaker (5 minutes)",
                        "8:37 AM - Audience Q&A session"
                    ],
                    tipsForSuccess: [
                        "Start with engaging hook",
                        "Use clear structure (introduction, body, conclusion)",
                        "Maintain appropriate pace",
                        "Use pauses effectively",
                        "End with memorable conclusion"
                    ]
                },
                recommendedStudents: selectedStudents.slice(0, 3).map(id => {
                     return {
                        studentId: id,
                        reason: "Demonstrates good communication skills and confidence",
                        role: "Speech Presenter"
                    };
                })
            }
        };

        return {
            ...baseActivities[type],
            difficulty: "medium" as const,
            activityType: type
        };
    };

    const applyAIActivity = (suggestion: AISuggestedActivity) => {
        // Check for students who already participated
        const studentsWithHistory = selectedStudents.filter(studentId => 
            hasStudentParticipatedInActivity(studentId, suggestion.activityType, selectedMonth, currentYear)
        );

        if (studentsWithHistory.length > 0) {
            const studentNames = studentsWithHistory.map(id => getStudentById(id)?.firstName).join(', ');
            if (!confirm(`The following students have already participated in ${getActivityTypeDisplayName(suggestion.activityType)}: ${studentNames}. Do you want to assign it again?`)) {
                return;
            }
        }

        setAssemblyActivities(prev => 
            prev.map(monthlyActivity => 
                monthlyActivity.month === selectedMonth && monthlyActivity.year === currentYear
                    ? {
                          ...monthlyActivity,
                          activities: monthlyActivity.activities.map(activityItem => ({
                              ...activityItem,
                              activities: {
                                  ...activityItem.activities,
                                  [suggestion.activityType]: true
                              }
                          }))
                      }
                    : monthlyActivity
            )
        );
        
        alert(`AI suggestion applied for ${suggestion.activityType}!`);
    };

    const getParticipationBadge = (studentId: string) => {
        const participation = getStudentParticipationInfo(studentId);
        if (participation.totalActivities === 0) return null;

        return (
            <div className="flex items-center gap-1 text-xs">
                <span className={`px-1.5 py-0.5 rounded-full ${
                    participation.totalActivities >= 5 ? 'bg-green-100 text-green-800' :
                    participation.totalActivities >= 2 ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {participation.totalActivities} activities
                </span>
                {participation.performanceScore > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                        ⭐ {participation.performanceScore.toFixed(1)}
                    </span>
                )}
            </div>
        );
    };

    const currentPageStudents = getCurrentPageStudents();
    const isAllSelectedOnCurrentPage = currentPageStudents.length > 0 && 
        currentPageStudents.every(student => selectedStudents.includes(student._id));

    return (
        <div className="p-6 bg-white rounded shadow">   
            <h1 className="text-2xl font-bold mb-4">Students Management</h1>
            
            <div className="p-6 bg-white rounded shadow"> 
               <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">
                Filter Students
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {/* House Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            House
                        </label>
                        <select 
                            className="w-full rounded border p-2"
                            value={selectedHouse}
                            onChange={(e) => setSelectedHouse(e.target.value)}
                        >
                            <option value="">All Houses</option>
                            <option value="Red">Red House</option>
                            <option value="Yellow">Yellow House</option>
                            <option value="Blue">Blue House</option>
                            <option value="Green">Green House</option>
                        </select>
                    </div>

                    {/* Class Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Class
                        </label>
                        <select 
                            className="w-full rounded border p-2"
                            value={selectedClass}
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                                setSelectedSection("");
                            }}
                        >
                            <option value="">All Classes</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.name}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Section Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section
                        </label>
                        <select 
                            className="w-full rounded border p-2"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            disabled={!selectedClass}
                        >
                            <option value="">All Sections</option>
                            {getSectionsForSelectedClass().map((section, index) => (
                                <option key={index} value={section}>
                                    {section}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Items Per Page */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Items Per Page
                        </label>
                        <select 
                            className="w-full rounded border p-2"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
               </div>

               {/* Clear Filters */}
               <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={clearFilters}
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                    >
                        Clear Filters
                    </button>
                    
                    {/* Pagination Info */}
                    <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, paginationInfo.totalStudents)} of {paginationInfo.totalStudents} students
                    </div>
               </div>

               {/* Selection Info */}
               {selectedStudents.length > 0 && (
                   <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded flex justify-between items-center">
                       <p className="text-blue-800 font-medium">
                           {selectedStudents.length} student(s) selected
                       </p>
                       <div className="flex gap-2">
                           <button 
                               className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors text-sm"
                               onClick={initializeAssemblyActivities}
                           >
                               Assign Assembly Activities
                           </button>
                           <button 
                               className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm"
                               onClick={() => {
                                   setShowAIActivities(true);
                                   generateAIActivities('all');
                               }}
                           >
                               AI Activity Suggestions
                           </button>
                           {showAssemblySection && (
                               <button 
                                   className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
                                   onClick={() => setShowSummary(true)}
                               >
                                   View Assembly Summary
                               </button>
                           )}
                       </div>
                   </div>
               )}

               {loading && <div className="text-center py-4">Loading students...</div>}

               <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded shadow border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 border-b">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={isAllSelectedOnCurrentPage}
                                    />
                                </th>
                                <th className="px-4 py-3 border-b text-left">Name</th>
                                <th className="px-4 py-3 border-b text-left">Class</th>
                                <th className="px-4 py-3 border-b text-left">Section</th>
                                <th className="px-4 py-3 border-b text-left">Roll No.</th>
                                <th className="px-4 py-3 border-b text-left">House</th>
                                <th className="px-4 py-3 border-b text-left">Participation</th>
                                <th className="px-4 py-3 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageStudents.length > 0 ? (
                                currentPageStudents.map((student) => {
                                    const participation = getStudentParticipationInfo(student._id);
                                    return (
                                        <tr key={student._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 border-b">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student._id)}
                                                    onChange={() => handleStudentSelection(student._id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 border-b">
                                                <div className="flex items-center gap-2">
                                                    {student.firstName} {student.lastName}
                                                    {participation.totalActivities > 0 && (
                                                        <span className="text-green-600" title="Has participated before">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-b">{student.Class}</td>
                                            <td className="px-4 py-3 border-b">{student.section}</td>
                                            <td className="px-4 py-3 border-b">{student.rollNumber}</td>
                                            <td className="px-4 py-3 border-b">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    student.house === 'Red' ? 'bg-red-100 text-red-800' :
                                                    student.house === 'Blue' ? 'bg-blue-100 text-blue-800' :
                                                    student.house === 'Green' ? 'bg-green-100 text-green-800' :
                                                    student.house === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {student.house}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b">
                                                {getParticipationBadge(student._id) || (
                                                    <span className="text-xs text-gray-500">No participation</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 border-b">
                                                <div className="flex gap-2">
                                                    <button 
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        onClick={() => setShowParticipationHistory(student._id)}
                                                    >
                                                        View History
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                                        View Details
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                                        No students found matching the filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
               </div>

               {/* Pagination Controls */}
               {paginationInfo.totalPages > 1 && (
                   <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                       <div className="text-sm text-gray-600">
                           Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
                       </div>
                       
                       <div className="flex gap-1">
                           {/* Previous Button */}
                           <button
                               onClick={goToPrevPage}
                               disabled={!paginationInfo.hasPrevPage}
                               className={`px-3 py-1 rounded border ${
                                   paginationInfo.hasPrevPage 
                                       ? 'bg-white text-gray-700 hover:bg-gray-50' 
                                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                               }`}
                           >
                               Previous
                           </button>

                           {/* Page Numbers */}
                           {getPageNumbers().map(page => (
                               <button
                                   key={page}
                                   onClick={() => goToPage(page)}
                                   className={`px-3 py-1 rounded border ${
                                       currentPage === page
                                           ? 'bg-blue-600 text-white border-blue-600'
                                           : 'bg-white text-gray-700 hover:bg-gray-50'
                                   }`}
                               >
                                   {page}
                               </button>
                           ))}

                           {/* Next Button */}
                           <button
                               onClick={goToNextPage}
                               disabled={!paginationInfo.hasNextPage}
                               className={`px-3 py-1 rounded border ${
                                   paginationInfo.hasNextPage 
                                       ? 'bg-white text-gray-700 hover:bg-gray-50' 
                                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                               }`}
                           >
                               Next
                           </button>
                       </div>
                   </div>
               )}

               {/* Student Participation History Modal */}
               {showParticipationHistory && (
                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                           <div className="p-6">
                               <div className="flex justify-between items-center mb-4">
                                   <h3 className="text-xl font-bold text-gray-800">
                                       Participation History
                                   </h3>
                                   <button
                                       onClick={() => setShowParticipationHistory(null)}
                                       className="text-gray-500 hover:text-gray-700"
                                   >
                                       ✕
                                   </button>
                               </div>
                               
                               {(() => {
                                   const student = getStudentById(showParticipationHistory);
                                   const participation = getStudentParticipationInfo(showParticipationHistory);
                                   
                                   return (
                                       <div>
                                           <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                               <h4 className="font-semibold text-lg mb-2">
                                                   {student?.firstName} {student?.lastName}
                                               </h4>
                                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                   <div>
                                                       <div className="text-gray-600">Total Activities</div>
                                                       <div className="font-bold text-xl">{participation.totalActivities}</div>
                                                   </div>
                                                   <div>
                                                       <div className="text-gray-600">Completed</div>
                                                       <div className="font-bold text-xl text-green-600">{participation.completedActivities}</div>
                                                   </div>
                                                   <div>
                                                       <div className="text-gray-600">Performance Score</div>
                                                       <div className="font-bold text-xl text-yellow-600">
                                                           {participation.performanceScore > 0 ? `⭐ ${participation.performanceScore.toFixed(1)}` : 'N/A'}
                                                       </div>
                                                   </div>
                                                   <div>
                                                       <div className="text-gray-600">Favorite Activity</div>
                                                       <div className="font-bold text-sm text-purple-600">
                                                           {getActivityTypeDisplayName(participation.favoriteActivity)}
                                                       </div>
                                                   </div>
                                               </div>
                                           </div>

                                           <div>
                                               <h4 className="font-semibold mb-3">Activity History</h4>
                                               {participation.activityHistory.length > 0 ? (
                                                   <div className="space-y-3">
                                                       {participation.activityHistory.map((history, index) => (
                                                           <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                               <div>
                                                                   <div className="font-medium">
                                                                       {getActivityTypeDisplayName(history.activityType)}
                                                                   </div>
                                                                   <div className="text-sm text-gray-600">
                                                                       {history.month} {history.year}
                                                                   </div>
                                                               </div>
                                                               <div className="flex items-center gap-3">
                                                                   {history.performanceRating && (
                                                                       <span className="text-yellow-600 font-medium">
                                                                           ⭐ {history.performanceRating}
                                                                       </span>
                                                                   )}
                                                                   <span className={`px-2 py-1 rounded text-xs ${
                                                                       history.completed 
                                                                           ? 'bg-green-100 text-green-800' 
                                                                           : 'bg-gray-100 text-gray-800'
                                                                   }`}>
                                                                       {history.completed ? 'Completed' : 'Assigned'}
                                                                   </span>
                                                               </div>
                                                           </div>
                                                       ))}
                                                   </div>
                                               ) : (
                                                   <p className="text-gray-500 text-center py-4">No participation history found</p>
                                               )}
                                           </div>
                                       </div>
                                   );
                               })()}
                           </div>
                       </div>
                   </div>
               )}

               {/* Assembly Summary Modal */}
               {showSummary && assemblySummary && (
                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                       <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                           <div className="p-6">
                               <div className="flex justify-between items-center mb-6">
                                   <h3 className="text-2xl font-bold text-blue-900">
                                       Assembly Summary - {assemblySummary.month} {assemblySummary.year}
                                   </h3>
                                   <button
                                       onClick={() => setShowSummary(false)}
                                       className="text-gray-500 hover:text-gray-700 text-xl"
                                   >
                                       ✕
                                   </button>
                               </div>

                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                   {/* Activity Assignments */}
                                   <div className="space-y-4">
                                       <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                           Activity Assignments
                                       </h4>
                                       
                                       {Object.entries(assemblySummary.activities).map(([activityType, students]) => (
                                           <div key={activityType} className="bg-gray-50 p-4 rounded-lg">
                                               <h5 className="font-medium text-gray-700 mb-2">
                                                   {getActivityTypeDisplayName(activityType)}
                                               </h5>
                                               {students.length > 0 ? (
                                                   <ul className="space-y-1">
                                                       {students.map((student, index) => (
                                                           <li key={index} className="text-sm text-gray-600 flex items-center">
                                                               <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                               {student}
                                                           </li>
                                                       ))}
                                                   </ul>
                                               ) : (
                                                   <p className="text-sm text-gray-500">No students assigned</p>
                                               )}
                                           </div>
                                       ))}
                                   </div>

                                   {/* Timeline & Materials */}
                                   <div className="space-y-4">
                                       <div>
                                           <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
                                               Assembly Timeline
                                           </h4>
                                           <div className="bg-blue-50 p-4 rounded-lg">
                                               <ul className="space-y-2">
                                                   {assemblySummary.timeline.map((item, index) => (
                                                       <li key={index} className="text-sm text-gray-700 flex items-start">
                                                           <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                                           {item}
                                                       </li>
                                                   ))}
                                               </ul>
                                           </div>
                                       </div>

                                       <div>
                                           <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
                                               Materials Needed
                                           </h4>
                                           <div className="bg-green-50 p-4 rounded-lg">
                                               <ul className="space-y-1">
                                                   {assemblySummary.materialsNeeded.map((material, index) => (
                                                       <li key={index} className="text-sm text-gray-700 flex items-center">
                                                           <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                           {material}
                                                       </li>
                                                   ))}
                                               </ul>
                                           </div>
                                       </div>
                                   </div>
                               </div>

                               {/* Quick Stats */}
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                   <div className="bg-purple-50 p-4 rounded-lg text-center">
                                       <div className="text-2xl font-bold text-purple-700">
                                           {assemblySummary.activities.conduction.length}
                                       </div>
                                       <div className="text-sm text-purple-600">Conductors</div>
                                   </div>
                                   <div className="bg-blue-50 p-4 rounded-lg text-center">
                                       <div className="text-2xl font-bold text-blue-700">
                                           {assemblySummary.activities.newsReading.length}
                                       </div>
                                       <div className="text-sm text-blue-600">News Readers</div>
                                   </div>
                                   <div className="bg-green-50 p-4 rounded-lg text-center">
                                       <div className="text-2xl font-bold text-green-700">
                                           {assemblySummary.activities.speech.length}
                                       </div>
                                       <div className="text-sm text-green-600">Speakers</div>
                                   </div>
                                   <div className="bg-orange-50 p-4 rounded-lg text-center">
                                       <div className="text-2xl font-bold text-orange-700">
                                           {assemblySummary.activities.talentShow.length}
                                       </div>
                                       <div className="text-sm text-orange-600">Talent Performers</div>
                                   </div>
                               </div>

                               <div className="flex justify-end gap-3 pt-4 border-t">
                                   <button
                                       onClick={() => setShowSummary(false)}
                                       className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600 transition-colors"
                                   >
                                       Close
                                   </button>
                                   <button
                                       onClick={() => {
                                           // Print or export functionality can be added here
                                           window.print();
                                       }}
                                       className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
                                   >
                                       Print Summary
                                   </button>
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {/* AI Suggested Activities Section with Chat */}
               {showAIActivities && selectedStudents.length > 0 && (
                   <div className="pt-6 bg-white rounded shadow mt-6 border border-green-200">
                        <div className="flex justify-between items-center mb-6 px-6">
                            <h3 className="text-xl font-bold text-green-900">
                                AI-Powered Activity Suggestions for {selectedMonth}
                            </h3>
                            <button
                                onClick={() => setShowAIActivities(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Activity Type Filter */}
                        <div className="flex flex-wrap gap-2 mb-6 px-6">
                            <button
                                onClick={() => generateAIActivities('all')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                    selectedActivityType === 'all'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All Activities
                            </button>
                            <button
                                onClick={() => generateAIActivities('conduction')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                    selectedActivityType === 'conduction'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                            >
                                Conduction Ideas
                            </button>
                            <button
                                onClick={() => generateAIActivities('newsReading')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                    selectedActivityType === 'newsReading'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                News Reading Ideas
                            </button>
                            <button
                                onClick={() => generateAIActivities('talentShow')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                    selectedActivityType === 'talentShow'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                                Talent Show Ideas
                            </button>
                            <button
                                onClick={() => generateAIActivities('speech')}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                    selectedActivityType === 'speech'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                }`}
                            >
                                Speech Ideas
                            </button>
                            <button
                                onClick={() => setChatActive(!chatActive)}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                    chatActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                }`}
                            >
                                {chatActive ? '💬 Hide Chat' : '💬 AI Chat'}
                            </button>
                        </div>

                        {/* Main Content Grid */}
                        <div className={`${chatActive ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''} px-6 pb-6`}>
                            {/* Activity Suggestions */}
                            <div className={chatActive ? '' : ''}>
                                {aiLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">AI is generating detailed activity suggestions...</p>
                                        <p className="text-sm text-gray-500">Creating speeches, news scripts, talent formats, and execution plans</p>
                                    </div>
                                ) : (
                                    <div className={`space-y-6 ${chatActive ? '' : 'max-w-4xl mx-auto'}`}>
                                        {aiSuggestedActivities.map((suggestion, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                                {/* Activity Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-xl font-semibold text-gray-800">{suggestion.activity}</h4>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                                                                suggestion.activityType === 'conduction' ? 'bg-purple-100 text-purple-800' :
                                                                suggestion.activityType === 'newsReading' ? 'bg-blue-100 text-blue-800' :
                                                                suggestion.activityType === 'talentShow' ? 'bg-green-100 text-green-800' :
                                                                'bg-orange-100 text-orange-800'
                                                            }`}>
                                                                {getActivityTypeDisplayName(suggestion.activityType)}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                suggestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                                suggestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {suggestion.difficulty}
                                                            </span>
                                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                                                                ⏱️ {suggestion.duration}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Activity Description */}
                                                <p className="text-gray-600 mb-6 leading-relaxed">{suggestion.description}</p>
                                                
                                                {/* Enhanced Activity Details */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                                    {/* Left Column - Basic Info */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h5 className="font-semibold text-gray-700 mb-2">Skills Developed</h5>
                                                            <div className="flex flex-wrap gap-1">
                                                                {suggestion.skills.map((skill, idx) => (
                                                                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        
                                                        <div>
                                                            <h5 className="font-semibold text-gray-700 mb-2">Materials Required</h5>
                                                            <ul className="text-sm text-gray-600 space-y-1">
                                                                {suggestion.materials.map((material, idx) => (
                                                                    <li key={idx} className="flex items-center">
                                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                                                        {material}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Speech Specific Details */}
                                                        {suggestion.speechType && (
                                                            <div>
                                                                <h5 className="font-semibold text-gray-700 mb-2">Speech Type & Topics</h5>
                                                                <div className="bg-orange-50 p-3 rounded">
                                                                    <p className="text-sm font-medium text-orange-800 mb-2">
                                                                        {suggestion.speechType}
                                                                    </p>
                                                                    {suggestion.speechTopics && (
                                                                        <ul className="text-xs text-orange-700 space-y-1">
                                                                            {suggestion.speechTopics.map((topic, idx) => (
                                                                                <li key={idx} className="flex items-center">
                                                                                    <span className="w-1 h-1 bg-orange-500 rounded-full mr-2"></span>
                                                                                    {topic}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Talent Show Specific Details */}
                                                        {suggestion.talentCategories && (
                                                            <div>
                                                                <h5 className="font-semibold text-gray-700 mb-2">Talent Categories</h5>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {suggestion.talentCategories.map((category, idx) => (
                                                                        <span key={idx} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                                                                            {category}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right Column - News Script & Execution */}
                                                    <div className="space-y-4">
                                                        {/* News Script */}
                                                        {suggestion.newsScript && (
                                                            <div>
                                                                <h5 className="font-semibold text-gray-700 mb-2">News Script Outline</h5>
                                                                <div className="bg-blue-50 p-3 rounded text-sm">
                                                                    <div className="mb-2">
                                                                        <span className="font-medium text-blue-800">Local News:</span>
                                                                        <ul className="text-blue-700 mt-1 space-y-1">
                                                                            {suggestion.newsScript.localNews.map((news, idx) => (
                                                                                <li key={idx} className="flex items-start">
                                                                                    <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                                                                    {news}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <span className="font-medium text-blue-800">International News:</span>
                                                                        <ul className="text-blue-700 mt-1 space-y-1">
                                                                            {suggestion.newsScript.internationalNews.map((news, idx) => (
                                                                                <li key={idx} className="flex items-start">
                                                                                    <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                                                                    {news}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    {suggestion.newsScript.weather && (
                                                                        <div className="text-blue-700">
                                                                            <span className="font-medium">Weather:</span> {suggestion.newsScript.weather}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Execution Plan */}
                                                        {suggestion.executionPlan && (
                                                            <div>
                                                                <h5 className="font-semibold text-gray-700 mb-2">Execution Plan</h5>
                                                                <div className="bg-green-50 p-3 rounded text-sm">
                                                                    <div className="mb-3">
                                                                        <span className="font-medium text-green-800">Preparation Steps:</span>
                                                                        <ul className="text-green-700 mt-1 space-y-1">
                                                                            {suggestion.executionPlan.preparationSteps.slice(0, 3).map((step, idx) => (
                                                                                <li key={idx} className="flex items-start">
                                                                                    <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                                                                    {step}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium text-green-800">Key Tips:</span>
                                                                        <ul className="text-green-700 mt-1 space-y-1">
                                                                            {suggestion.executionPlan.tipsForSuccess.slice(0, 2).map((tip, idx) => (
                                                                                <li key={idx} className="flex items-start">
                                                                                    <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                                                                    {tip}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Student Recommendations */}
                                                {suggestion.recommendedStudents && suggestion.recommendedStudents.length > 0 && (
                                                    <div className="mb-6">
                                                        <h5 className="font-semibold text-gray-700 mb-3">Recommended Students</h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {suggestion.recommendedStudents.map((rec, idx) => {
                                                                const student = getStudentById(rec.studentId);
                                                                if (!student) return null;
                                                                
                                                                return (
                                                                    <div key={idx} className="bg-gray-50 p-3 rounded border">
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <div className="font-medium text-gray-800">
                                                                                    {student.firstName} {student.lastName}
                                                                                </div>
                                                                                <div className="text-xs text-gray-600">
                                                                                    Class {student.Class}{student.section} • {rec.role}
                                                                                </div>
                                                                            </div>
                                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                                student.house === 'Red' ? 'bg-red-100 text-red-800' :
                                                                                student.house === 'Blue' ? 'bg-blue-100 text-blue-800' :
                                                                                student.house === 'Green' ? 'bg-green-100 text-green-800' :
                                                                                'bg-yellow-100 text-yellow-800'
                                                                            }`}>
                                                                                {student.house}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-600 mt-2">{rec.reason}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-3 pt-4 border-t">
                                                    <button
                                                        onClick={() => applyAIActivity(suggestion)}
                                                        className={`flex-1 py-3 px-4 rounded font-medium text-white transition-colors ${
                                                            suggestion.activityType === 'conduction' ? 'bg-purple-600 hover:bg-purple-700' :
                                                            suggestion.activityType === 'newsReading' ? 'bg-blue-600 hover:bg-blue-700' :
                                                            suggestion.activityType === 'talentShow' ? 'bg-green-600 hover:bg-green-700' :
                                                            'bg-orange-600 hover:bg-orange-700'
                                                        }`}
                                                    >
                                                        Apply {getActivityTypeDisplayName(suggestion.activityType)}
                                                    </button>
                                                    <button
                                                        onClick={() => updateActivityWithAI(suggestion, "Make this activity more engaging and detailed with better execution steps")}
                                                        className="bg-indigo-500 text-white py-3 px-4 rounded font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
                                                        disabled={isChatLoading}
                                                    >
                                                        {isChatLoading ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            'Enhance with AI'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* AI Chat Section */}
                            {chatActive && (
                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="p-4 border-b bg-indigo-50 rounded-t-lg">
                                        <h4 className="font-semibold text-indigo-800">AI Activity Assistant</h4>
                                        <p className="text-sm text-indigo-600">Get personalized suggestions for speeches, news scripts, and talent shows</p>
                                    </div>
                                    
                                    {/* Chat Messages */}
                                    <div 
                                        ref={chatContainerRef}
                                        className="h-96 overflow-y-auto p-4 space-y-4"
                                    >
                                        {chatMessages.length === 0 ? (
                                            <div className="text-center text-gray-500 py-8">
                                                <p className="mb-4">Ask me to create specific activities or improve existing ones!</p>
                                                <div className="space-y-2">
                                                    <button 
                                                        onClick={() => handleQuickQuestion("Create inspirational speech topics for students")}
                                                        className="block w-full text-left p-3 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 border"
                                                    >
                                                        💬 Suggest speech topics
                                                    </button>
                                                    <button 
                                                        onClick={() => handleQuickQuestion("Write a news script with local and international news")}
                                                        className="block w-full text-left p-3 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 border"
                                                    >
                                                        📰 Create news script
                                                    </button>
                                                    <button 
                                                        onClick={() => handleQuickQuestion("Plan a talent show with different categories")}
                                                        className="block w-full text-left p-3 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 border"
                                                    >
                                                        🎭 Organize talent show
                                                    </button>
                                                    <button 
                                                        onClick={() => handleQuickQuestion("How to make assembly conduction more engaging?")}
                                                        className="block w-full text-left p-3 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 border"
                                                    >
                                                        🎤 Improve assembly conduction
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            chatMessages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] rounded-lg p-3 ${
                                                            message.type === 'user'
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                        <p className={`text-xs mt-1 ${
                                                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                                        }`}>
                                                            {message.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {isChatLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-gray-100 rounded-lg p-3">
                                                    <div className="flex space-x-2">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Chat Input */}
                                    <div className="p-4 border-t">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={userMessage}
                                                onChange={(e) => setUserMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                                placeholder="Ask about specific activities, speeches, news scripts, or talent shows..."
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                disabled={isChatLoading}
                                            />
                                            <button
                                                onClick={sendChatMessage}
                                                disabled={!userMessage.trim() || isChatLoading}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isChatLoading ? 'Sending...' : 'Send'}
                                            </button>
                                            <button
                                                onClick={clearChat}
                                                className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 pb-6 border-t pt-4">
                            <div className="text-center text-sm text-gray-500">
                                <p>🎯 AI-powered suggestions for {selectedStudents.length} students • 📝 Detailed execution plans • 🎤 Speech types & topics</p>
                                <p className="mt-1">📰 News scripts with local & international news • 🎭 Talent show categories • 👥 Student recommendations</p>
                            </div>
                        </div>
                   </div>
               )}

               {/* Assembly Activity Assignment Section */}
               {showAssemblySection && selectedStudents.length > 0 && (
                   <div className="pt-6 bg-white rounded shadow mt-6 border border-purple-200">
                        <div className="flex justify-between items-center mb-6 px-6">
                            <h3 className="text-xl font-bold text-purple-900">
                                Assembly Activity Assignment - {currentYear}
                            </h3>
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Month
                                    </label>
                                    <select 
                                        className="rounded border p-2"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        {MONTHS.map(month => {
                                            const summary = getActivitySummary(month);
                                            return (
                                                <option key={month} value={month}>
                                                    {month} ({summary.assigned}/{summary.total})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex flex-wrap gap-2 mb-6 px-6">
                            {MONTHS.map(month => {
                                const summary = getActivitySummary(month);
                                const isActive = month === selectedMonth;
                                return (
                                    <button
                                        key={month}
                                        onClick={() => setSelectedMonth(month)}
                                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-purple-600 text-white'
                                                : summary.assigned > 0
                                                ? summary.completed === summary.assigned
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {month} ({summary.assigned}/{summary.total})
                                        {summary.completed > 0 && ` • ${summary.completed}✓`}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Activity Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded shadow border">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 border-b text-left">Student Name</th>
                                        <th className="px-4 py-3 border-b text-left">Class</th>
                                        <th className="px-4 py-3 border-b text-center">Conduction</th>
                                        <th className="px-4 py-3 border-b text-center">News Reading</th>
                                        <th className="px-4 py-3 border-b text-center">Talent Show</th>
                                        <th className="px-4 py-3 border-b text-center">Speech</th>
                                        <th className="px-4 py-3 border-b text-center">Status</th>
                                        <th className="px-4 py-3 border-b text-center">Completion</th>
                                    </tr>
                                </thead>
                                <tbody>  
                                    {getActivitiesForSelectedMonth().map((activity) => {
                                        const student = getStudentById(activity.studentId);
                                        if (!student) return null;
                                        
                                        const hasActivity = Object.values(activity.activities).some(value => value);
                                        const participation = getStudentParticipationInfo(activity.studentId);
                                        
                                        return (
                                            <tr key={activity.studentId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 border-b">
                                                    <div className="flex items-center gap-2">
                                                        {student.firstName} {student.lastName}
                                                        {participation.totalActivities > 0 && (
                                                            <span className="text-green-600 text-xs" title="Has participation history">
                                                                ({participation.totalActivities})
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-b">{student.Class}</td>
                                                
                                                {/* Activity Checkboxes with Participation Warnings */}
                                                {(['conduction', 'newsReading', 'talentShow', 'speech'] as const).map(activityType => {
                                                    const hasParticipated = hasStudentParticipatedInActivity(
                                                        activity.studentId, 
                                                        activityType, 
                                                        selectedMonth, 
                                                        currentYear
                                                    );
                                                    
                                                    return (
                                                        <td key={activityType} className="px-4 py-3 border-b text-center">
                                                            <div className="flex flex-col items-center">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={activity.activities[activityType]}
                                                                    onChange={(e) => handleAssemblyActivityChange(
                                                                        activity.studentId, 
                                                                        selectedMonth, 
                                                                        activityType, 
                                                                        e.target.checked
                                                                    )}
                                                                    className={`h-4 w-4 ${
                                                                        activityType === 'conduction' ? 'text-purple-600 focus:ring-purple-500' :
                                                                        activityType === 'newsReading' ? 'text-blue-600 focus:ring-blue-500' :
                                                                        activityType === 'talentShow' ? 'text-green-600 focus:ring-green-500' :
                                                                        'text-orange-600 focus:ring-orange-500'
                                                                    }`}
                                                                />
                                                                {hasParticipated && (
                                                                    <span className="text-xs text-red-600 mt-1" title="Already participated">
                                                                        ✓
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                                
                                                <td className="px-4 py-3 border-b text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        hasActivity 
                                                            ? activity.completed
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {hasActivity 
                                                            ? activity.completed ? 'Completed' : 'Assigned'
                                                            : 'Not Assigned'
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-b text-center">
                                                    {hasActivity && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleActivityCompletion(activity.studentId, selectedMonth, true, 5)}
                                                                className={`px-2 py-1 rounded text-xs ${
                                                                    activity.completed 
                                                                        ? 'bg-green-500 text-white' 
                                                                        : 'bg-gray-200 text-gray-700 hover:bg-green-200'
                                                                }`}
                                                            >
                                                                ✓ Complete
                                                            </button>
                                                            {activity.completed && (
                                                                <select 
                                                                    value={activity.performanceRating || 0}
                                                                    onChange={(e) => handleActivityCompletion(
                                                                        activity.studentId, 
                                                                        selectedMonth, 
                                                                        true, 
                                                                        parseInt(e.target.value)
                                                                    )}
                                                                    className="px-1 py-1 rounded text-xs border"
                                                                >
                                                                    <option value={0}>Rate</option>
                                                                    <option value={1}>1⭐</option>
                                                                    <option value={2}>2⭐</option>
                                                                    <option value={3}>3⭐</option>
                                                                    <option value={4}>4⭐</option>
                                                                    <option value={5}>5⭐</option>
                                                                </select>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary and Actions */}
                        <div className="mt-6 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                    <div className="text-sm text-blue-600">Total Students</div>
                                    <div className="text-lg font-bold text-blue-800">{selectedStudents.length}</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                                    <div className="text-sm text-purple-600">Current Month</div>
                                    <div className="text-lg font-bold text-purple-800">{selectedMonth}</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded border border-green-200">
                                    <div className="text-sm text-green-600">Assigned in {selectedMonth}</div>
                                    <div className="text-lg font-bold text-green-800">
                                        {getActivitySummary(selectedMonth).assigned}
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                                    <div className="text-sm text-orange-600">Completed</div>
                                    <div className="text-lg font-bold text-orange-800">
                                        {getActivitySummary(selectedMonth).completed}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    {selectedStudents.length} students selected • 
                                    <span className="text-red-600 ml-1">
                                        ⚠️ Red checkmarks indicate previous participation
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAssemblySection(false)}
                                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitSingleMonthActivities}
                                        disabled={saving}
                                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : `Save ${selectedMonth}`}
                                    </button>
                                    <button
                                        onClick={submitAssemblyActivities}
                                        disabled={saving}
                                        className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save All Months'}
                                    </button>
                                </div>
                            </div>
                        </div>
                   </div>
               )}
            </div>
        </div>
    );
}