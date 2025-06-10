import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Briefcase, FileText, Calendar, StickyNote, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const statusOptions = ["Applied", "Interview", "Offer", "Rejected", "Accepted"];
const statusColors: any = {
  "Applied": "bg-blue-200 text-blue-800",
  "Interview": "bg-yellow-200 text-yellow-800",
  "Offer": "bg-green-200 text-green-800",
  "Rejected": "bg-red-200 text-red-700",
  "Accepted": "bg-green-300 text-green-900"
};

interface JobApp {
  id?: string;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
  notes?: string;
}

const JobApplicationsManager: React.FC = () => {
  const [jobs, setJobs] = useState<JobApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApp | null>(null);
  const [form, setForm] = useState<JobApp>({
    company: "",
    position: "",
    status: "Applied",
    appliedDate: "",
    notes: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
      setLoading(false);
    };
    fetchJobs();
  }, [refresh]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setMsg("");
  };

  // Open modal to add or edit
  const openModal = (job?: JobApp) => {
    setMsg(""); setError("");
    setEditingJob(job || null);
    setForm(job ? {
      company: job.company,
      position: job.position,
      status: job.status,
      appliedDate: job.appliedDate?.slice(0, 10),
      notes: job.notes || "",
    } : { company: "", position: "", status: "Applied", appliedDate: "", notes: "" });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError("");
    try {
      const token = localStorage.getItem("token");
      if (editingJob && editingJob.id) {
        await axios.put(
          `${API_URL}/jobs/${editingJob.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMsg("Updated!");
      } else {
        await axios.post(
          `${API_URL}/jobs`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMsg("Added!");
      }
      setTimeout(() => {
        setShowModal(false); setRefresh(r => !r);
      }, 900);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error occurred");
    }
  };

  // Delete job
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(jobs => jobs.filter(j => j.id !== id));
    } catch {}
    setDeletingId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Add button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 3 }}
        whileTap={{ scale: 0.95, rotate: -3 }}
        className="fixed bottom-8 right-8 z-20 rounded-full bg-gradient-to-br from-pink-300 via-blue-200 to-green-200 shadow-2xl p-4 hover:shadow-pink-300"
        title="Add job application"
        onClick={() => openModal()}
      >
        <PlusCircle className="w-10 h-10 text-pink-600" />
      </motion.button>
      {/* Job cards */}
      {loading ? (
        <div className="text-center mt-8 text-lg text-gray-500">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <motion.div
          className="text-center mt-8 text-lg text-gray-400"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          No applications yet. Start tracking your dream jobs!
        </motion.div>
      ) : (
        <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2">
          {jobs.map(job => (
            <motion.div
              key={job.id}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-5 flex flex-col gap-2 border border-pink-100 relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  title="Edit"
                  className="rounded-full hover:bg-blue-200 p-1 transition"
                  onClick={() => openModal(job)}
                >
                  <Pencil className="w-5 h-5 text-blue-500" />
                </button>
                <button
                  title="Delete"
                  className="rounded-full hover:bg-red-200 p-1 transition"
                  disabled={deletingId === job.id}
                  onClick={() => handleDelete(job.id!)}
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
              <div className="absolute top-2 left-2 px-3 py-1 rounded-xl text-xs font-bold shadow-sm"
                   style={{ background: "var(--tw-gradient-from, #b7eaff)", color: "#555" }}>
                <span className={statusColors[job.status] || "bg-gray-200 text-gray-600"}>
                  {job.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xl font-bold text-pink-400 mb-1">
                <Briefcase className="w-6 h-6" />
                {job.position}
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-lg">
                <FileText className="w-5 h-5 text-blue-400" />
                {job.company}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-base">
                <Calendar className="w-5 h-5 text-green-400" />
                Applied on {new Date(job.appliedDate).toLocaleDateString()}
              </div>
              {job.notes && (
                <div className="flex items-center gap-2 text-gray-600 text-base mt-1">
                  <StickyNote className="w-5 h-5 text-yellow-400" />
                  {job.notes}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 w-[90vw] max-w-xl flex flex-col gap-4 relative"
              onSubmit={handleSubmit}
            >
              <button
                type="button"
                className="absolute top-2 right-3 text-gray-400 hover:text-red-400 text-xl"
                onClick={() => setShowModal(false)}
                tabIndex={-1}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-center mb-1 flex items-center justify-center gap-2">
                <Briefcase className="text-pink-400 w-7 h-7" />
                {editingJob ? "Edit Job" : "Add Job Application"}
              </h2>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <FileText className="w-5 h-5 text-blue-400" /> Position
                </label>
                <Input
                  type="text"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <Briefcase className="w-5 h-5 text-pink-400" /> Company
                </label>
                <Input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Google"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="w-5 h-5 text-green-400" /> Applied Date
                </label>
                <Input
                  type="date"
                  name="appliedDate"
                  value={form.appliedDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <FileText className="w-5 h-5 text-blue-400" /> Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="rounded-lg border-gray-300 py-2 px-3"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <StickyNote className="w-5 h-5 text-yellow-400" /> Notes
                </label>
                <Textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Interview scheduled, referral from Jane, etc."
                  rows={2}
                />
              </div>
              {error && <div className="text-red-500 text-center">{error}</div>}
              {msg && <div className="text-green-600 text-center">{msg}</div>}
              <Button
                className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl w-full mt-2 font-semibold py-2 text-lg shadow-lg"
              >
                {editingJob ? "Save Changes" : "Add Job"}
              </Button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobApplicationsManager;
