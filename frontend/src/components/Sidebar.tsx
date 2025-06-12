import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlusCircle, LayoutDashboard, User, LogOut, Columns3, CalendarClock } from "lucide-react";

const sidebarButtons = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="w-7 h-7 text-pink-400" />,
    route: "/dashboard",
    hoverBg: "bg-pink-100",
  },
  {
    label: "Add Application",
    icon: <PlusCircle className="w-8 h-8 text-green-500" />,
    action: "add",
    hoverBg: "bg-green-100",
  },
  {
    label: "Kanban Board",
    icon: <Columns3 className="w-7 h-7 text-purple-400" />, // Purple vibe!
    route: "/kanban",
    hoverBg: "bg-purple-100",
  },
  {
    icon: <CalendarClock className="w-7 h-7" />,
    to: "/calendar",
    label: "Calendar",
  },
  {
    label: "Profile",
    icon: <User className="w-7 h-7 text-blue-400" />,
    route: "/profile",
    hoverBg: "bg-blue-100",
  },
  {
    label: "Logout",
    icon: <LogOut className="w-7 h-7 text-red-400" />,
    action: "logout",
    hoverBg: "bg-red-100",
  },
];

const Sidebar: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
  const navigate = useNavigate();

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 bg-gradient-to-b from-pink-200 via-blue-100 to-green-100 shadow-xl flex flex-col items-center py-6 z-50">
      {sidebarButtons.map((btn, idx) => (
        <motion.button
          key={btn.label}
          whileHover={{ scale: 1.18, rotate: 3 }}
          whileTap={{ scale: 0.96, rotate: -7 }}
          title={btn.label}
          className={`mb-8 p-2 rounded-lg flex items-center justify-center transition ${btn.hoverBg} focus:outline-none`}
          onClick={() => {
            if (btn.action === "add") onAdd();
            else if (btn.action === "logout") {
              localStorage.removeItem("token");
              window.location.href = "/login";
            } else if (btn.route) navigate(btn.route);
          }}
          style={{ background: "transparent", border: "none" }}
        >
          {btn.icon}
        </motion.button>
      ))}
    </aside>
  );
};

export default Sidebar;
