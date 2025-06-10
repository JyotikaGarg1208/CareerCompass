import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">Your Dashboard</h1>
      <p className="text-xl text-gray-600 mb-8">You are logged in! 🎉</p>
      <button
        className="bg-pink-400 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:bg-pink-500"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
