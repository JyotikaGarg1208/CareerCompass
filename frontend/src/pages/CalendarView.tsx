import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, isBefore } from "date-fns";
import { enGB } from "date-fns/locale";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { CalendarCheck, Briefcase, StickyNote } from "lucide-react";
import type { View } from "react-big-calendar";

const locales = { "en-GB": enGB };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface JobApp {
  id: string;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
  interviewDate?: string;
  notes?: string;
  avatarUrl?: string;
}

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  job: JobApp;
}

const CalendarView: React.FC = () => {
  const [jobs, setJobs] = useState<JobApp[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [calendarView, setCalendarView] = useState<View>("month");
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const jobEvents: CalendarEvent[] = [];
    jobs.forEach((job) => {
      if (job.interviewDate && job.status === "Interview") {
        jobEvents.push({
          id: job.id,
          title: `Interview: ${job.position} @ ${job.company}`,
          start: new Date(job.interviewDate),
          end: new Date(job.interviewDate),
          job,
        });
      }
    });
    setEvents(jobEvents);
  }, [jobs]);

  useEffect(() => {
    const now = new Date();
    events.forEach((event) => {
      if (
        isBefore(now, event.start) &&
        isBefore(event.start, addDays(now, 1))
      ) {
        toast.success(
          `You have an interview for ${event.job.position} at ${event.job.company} on ${format(
            event.start,
            "do MMM yyyy"
          )}!`
        );
      }
    });
  }, [events]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let bg = "#ffe066",
      color = "#703be7";
    if (event.job.status === "Interview") {
      bg = "#ffe066";
      color = "#8a5af5";
    } else if (event.job.status === "Offer") {
      bg = "#caffbf";
      color = "#21774a";
    } else if (event.job.status === "Accepted") {
      bg = "#bdb2ff";
      color = "#5c29b9";
    } else if (event.job.status === "Rejected") {
      bg = "#ffd6e0";
      color = "#ea4c89";
    } else {
      bg = "#d0f4ff";
      color = "#0077b6";
    }
    return {
      style: {
        backgroundColor: bg,
        color,
        borderRadius: "16px",
        border: "none",
        padding: "4px 10px",
        fontWeight: "bold",
        fontSize: "1.1em",
        boxShadow: "0 2px 8px 0 rgba(124,58,237,0.10)",
      },
    };
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-tr from-pink-100 via-blue-50 to-green-100">
      <Toaster />
      <div className="flex gap-2 items-center justify-center mb-6">
        <CalendarCheck className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-center text-purple-600 drop-shadow">
          Interview Calendar
        </h1>
      </div>
      <div className="max-w-5xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600, borderRadius: 24 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event as CalendarEvent)}
          view={calendarView}
          onView={setCalendarView}
          date={calendarDate}
          onNavigate={setCalendarDate}
        />
      </div>
      {/* Modal popup for event details */}
      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl min-w-[320px]">
            <div className="flex items-center mb-4 gap-2">
              <Briefcase className="w-7 h-7 text-pink-400" />
              <h2 className="text-2xl font-bold text-purple-700 mb-1">
                {selectedEvent.job.position}
              </h2>
            </div>
            <div className="mb-2 text-lg font-medium text-gray-700">
              {selectedEvent.job.company}
            </div>
            <div className="mb-2 text-base text-gray-500 flex gap-2 items-center">
              <CalendarCheck className="w-5 h-5 text-blue-400" />
              Interview on:{" "}
              <span className="font-semibold text-green-700 ml-1">
                {format(selectedEvent.start, "do MMM yyyy, h:mm a")}
              </span>
            </div>
            {selectedEvent.job.notes && (
              <div className="mb-2 text-base text-gray-700 flex gap-2 items-center">
                <StickyNote className="w-5 h-5 text-yellow-400" />
                {selectedEvent.job.notes}
              </div>
            )}
            <button
              className="mt-4 px-5 py-2 rounded-xl bg-purple-400 hover:bg-purple-500 text-white font-bold shadow"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
