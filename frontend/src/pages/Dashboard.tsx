import React, { useRef } from "react";
import Sidebar from "@/components/Sidebar";
import JobApplicationsManager from "@/pages/JobApplicationManager";
import type { JobApplicationsManagerHandle } from "@/pages/JobApplicationManager";


const Dashboard: React.FC = () => {
  const jobManagerRef = useRef<JobApplicationsManagerHandle>(null);

  return (
    <div className="min-h-screen pt-12 pb-24 px-3 sm:px-12 flex flex-col items-center bg-transparent">
      {/* Sidebar with onAdd handler */}
      <Sidebar onAdd={() => jobManagerRef.current?.openModal()} />
      <h1 className="text-4xl font-extrabold text-slate-800 mb-2 text-center">
        🎯 Job Application Tracker
      </h1>
      <p className="text-xl text-gray-600 mb-8 text-center">
        Stay motivated and on track to your next offer!
      </p>
      <JobApplicationsManager ref={jobManagerRef} />
    </div>
  );
};

export default Dashboard;
