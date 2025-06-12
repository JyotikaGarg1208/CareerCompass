import React from "react";
import Sidebar from "@/components/Sidebar";

const SIDEBAR_WIDTH = 96;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen w-full bg-gradient-to-tr from-pink-100 via-blue-50 to-green-100">
    <Sidebar onAdd={() => {}} />
    <main className="flex-1 p-0 m-0 min-h-screen" style={{ marginLeft: SIDEBAR_WIDTH }}>
      {children}
    </main>
  </div>
);

export default MainLayout;
