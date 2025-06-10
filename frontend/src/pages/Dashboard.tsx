import JobApplicationsManager from "@/pages/JobApplicationManager";

const Dashboard: React.FC = () => (
  <div className="min-h-screen pt-12 pb-24 px-3 sm:px-12 flex flex-col items-center bg-transparent">
    <h1 className="text-4xl font-extrabold text-slate-800 mb-2 text-center">
      🎯 Job Application Tracker
    </h1>
    <p className="text-xl text-gray-600 mb-8 text-center">
      Stay motivated and on track to your next offer!
    </p>
    <JobApplicationsManager />
    <button
      className="mt-10 bg-pink-400 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:bg-pink-500"
      onClick={() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }}
    >
      Logout
    </button>
  </div>
);

export default Dashboard;
