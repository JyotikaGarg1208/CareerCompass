import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Columns3,
  CalendarClock,
  User,
  LogOut,
} from "lucide-react";

const sidebarButtons = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="w-7 h-7" />,
    route: "/dashboard",
  },
  {
    label: "Add Application",
    icon: <PlusCircle className="w-7 h-7" />,
    id: "add", // No route! Special action.
  },
  {
    label: "Kanban Board",
    icon: <Columns3 className="w-7 h-7" />,
    route: "/kanban",
  },
  {
    label: "Calendar",
    icon: <CalendarClock className="w-7 h-7" />,
    route: "/calendar",
  },
  {
    label: "Profile",
    icon: <User className="w-7 h-7" />,
    route: "/profile",
  },
  {
    label: "Logout",
    icon: <LogOut className="w-7 h-7" />,
    id: "logout",
  },
];

interface SidebarProps {
  onAdd?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAdd }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (btn: any) => {
    if (btn.id === "logout") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (btn.id === "add" && onAdd) {
      onAdd();
    } else if (btn.route) {
      navigate(btn.route);
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 bg-gradient-to-b from-pink-200 via-blue-100 to-green-100 shadow-xl flex flex-col items-center py-6 z-50">
      {sidebarButtons.map((btn) => (
        <motion.button
          key={btn.label}
          whileHover={{ scale: 1.18, rotate: 3 }}
          whileTap={{ scale: 0.96, rotate: -7 }}
          title={btn.label}
          className={`mb-8 p-2 rounded-lg flex items-center justify-center transition-all
            ${location.pathname === btn.route && btn.route ? "bg-white/90 shadow-lg" : ""}
            focus:outline-none`}
          onClick={() => handleClick(btn)}
          style={{ background: "transparent", border: "none" }}
        >
          {btn.icon}
        </motion.button>
      ))}
    </aside>
  );
};

export default Sidebar;
