import AssemblyActivities from "@/components/assemblyActivities";

export default function TeacherProfile() {  
    return (
        <div className="p-6 bg-white rounded shadow">   
            <h1 className="text-2xl font-bold mb-4">Teacher Profile</h1>
            <p className="text-gray-600">This is where you can view and edit your profile information.</p>
            {/* Add profile management features here */}    
            <AssemblyActivities />

        </div>
    );
}