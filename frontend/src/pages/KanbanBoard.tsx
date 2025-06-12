import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import {
  FileText,
  Briefcase,
  Calendar,
  StickyNote,
  Trash2,
  Pencil,
  GripVertical,
  UserCircle2,
  FolderKanban
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const statusLanes = [
  { key: "Applied", color: "bg-blue-100", label: "Applied", border: "border-blue-200" },
  { key: "Interview", color: "bg-yellow-100", label: "Interview", border: "border-yellow-200" },
  { key: "Offer", color: "bg-green-100", label: "Offer", border: "border-green-200" },
  { key: "Rejected", color: "bg-red-100", label: "Rejected", border: "border-red-200" },
  { key: "Accepted", color: "bg-purple-100", label: "Accepted", border: "border-purple-200" },
];

interface JobApp {
  id?: string;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
  interviewDate?: string;
  notes?: string;
  avatarUrl?: string;
}

const randomAvatar = () =>
  `https://ui-avatars.com/api/?name=Job&background=random&color=fff`;

const KanbanBoard: React.FC = () => {
  const [jobs, setJobs] = useState<JobApp[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addLane, setAddLane] = useState<string | null>(null);
  const [editJob, setEditJob] = useState<JobApp | null>(null);
  const [form, setForm] = useState<JobApp>({
    company: "",
    position: "",
    status: "",
    appliedDate: "",
    notes: "",
    avatarUrl: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
      setLoading(false);
    };
    fetchJobs();
  }, [refresh]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setMsg("");
  };

  // Drag-n-drop status updates
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const job = jobs.find((j) => j.id === draggableId);
    if (!job || job.status === destination.droppableId) return;

    const token = localStorage.getItem("token");
    await axios.put(
      `${API_URL}/jobs/${job.id}`,
      { ...job, status: destination.droppableId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRefresh((r) => !r);
  };

  // Add or Edit Job (inline)
  const handleSubmit = async (
    e: React.FormEvent,
    isEdit: boolean = false
  ) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (isEdit && editJob && editJob.id) {
        await axios.put(
          `${API_URL}/jobs/${editJob.id}`,
          { ...form },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditJob(null);
      } else {
        await axios.post(
          `${API_URL}/jobs`,
          { ...form, avatarUrl: randomAvatar() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAddLane(null);
      }
      setForm({
        company: "",
        position: "",
        status: "",
        appliedDate: "",
        notes: "",
        avatarUrl: "",
      });
      setMsg(isEdit ? "Updated!" : "Added!");
      setTimeout(() => setRefresh((r) => !r), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error occurred");
    }
  };

  // Edit card from Kanban
  const startEdit = (job: JobApp) => {
    setEditJob(job);
    setForm({
      company: job.company,
      position: job.position,
      status: job.status,
      appliedDate: job.appliedDate?.slice(0, 10),
      notes: job.notes || "",
      avatarUrl: job.avatarUrl || randomAvatar(),
      id: job.id,
    });
  };

  // Delete card
  const handleDelete = async (id?: string) => {
    if (!id) return;
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/jobs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRefresh((r) => !r);
  };

  return (
    <div className="w-full p-0 m-0 min-h-screen">
      <div className="flex items-center justify-center py-8 mb-2 gap-3">
        <FolderKanban className="w-10 h-10 text-yellow-400 drop-shadow" />
        <h1 className="text-4xl font-bold text-center text-purple-600 drop-shadow">
          Kanban Board
        </h1>
      </div>
      {loading ? (
        <div className="text-center text-gray-400 py-12 text-xl">Loading...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-5 justify-center items-start overflow-x-auto pb-12 w-full">
            {statusLanes.map((lane) => (
              <Droppable key={lane.key} droppableId={lane.key}>
                {(provided, snapshot) => (
                  <div
                    className={`rounded-3xl p-4 w-[340px] min-h-[520px] ${lane.color} ${lane.border} border-2 shadow-xl flex flex-col gap-4 transition-all`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-xl font-bold capitalize text-gray-700">
                        {lane.label}
                      </h2>
                      <button
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 border border-gray-300 hover:bg-gray-200 text-2xl font-bold text-purple-500 shadow transition"
                        onClick={() => {
                          setAddLane(lane.key);
                          setEditJob(null);
                          setForm({
                            company: "",
                            position: "",
                            status: lane.key,
                            appliedDate: "",
                            notes: "",
                            avatarUrl: randomAvatar(),
                          });
                        }}
                        title="Add card"
                      >
                        +
                      </button>
                    </div>
                    {/* Inline Add Card */}
                    {addLane === lane.key && (
                      <form
                        className="bg-white/90 rounded-xl p-3 mb-2 shadow border border-gray-200 flex flex-col gap-2"
                        onSubmit={(e) => handleSubmit(e)}
                      >
                        <input
                          type="text"
                          name="position"
                          placeholder="Position"
                          className="rounded border px-2 py-1"
                          value={form.position}
                          onChange={handleInput}
                          required
                        />
                        <input
                          type="text"
                          name="company"
                          placeholder="Company"
                          className="rounded border px-2 py-1"
                          value={form.company}
                          onChange={handleInput}
                          required
                        />
                        <input
                          type="date"
                          name="appliedDate"
                          className="rounded border px-2 py-1"
                          value={form.appliedDate}
                          onChange={handleInput}
                          required
                        />
                        <textarea
                          name="notes"
                          placeholder="Notes"
                          className="rounded border px-2 py-1"
                          rows={1}
                          value={form.notes}
                          onChange={handleInput}
                        />
                        <div className="flex justify-between mt-1">
                          <button
                            type="submit"
                            className="bg-purple-400 text-white px-3 py-1 rounded shadow font-bold"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="text-gray-500 font-semibold"
                            onClick={() => setAddLane(null)}
                          >
                            Cancel
                          </button>
                        </div>
                        {error && <div className="text-red-500">{error}</div>}
                        {msg && <div className="text-green-600">{msg}</div>}
                      </form>
                    )}

                    {/* Cards */}
                    {jobs
                      .filter((j) => j.status === lane.key)
                      .map((job, idx) =>
                        editJob && editJob.id === job.id ? (
                          // Edit inline
                          <form
                            key={job.id}
                            className="bg-white/90 rounded-xl p-4 mb-2 shadow border border-gray-200 flex flex-col gap-2"
                            onSubmit={(e) => handleSubmit(e, true)}
                          >
                            <input
                              type="text"
                              name="position"
                              placeholder="Position"
                              className="rounded border px-2 py-1"
                              value={form.position}
                              onChange={handleInput}
                              required
                            />
                            <input
                              type="text"
                              name="company"
                              placeholder="Company"
                              className="rounded border px-2 py-1"
                              value={form.company}
                              onChange={handleInput}
                              required
                            />
                            <input
                              type="date"
                              name="appliedDate"
                              className="rounded border px-2 py-1"
                              value={form.appliedDate}
                              onChange={handleInput}
                              required
                            />
                            <textarea
                              name="notes"
                              placeholder="Notes"
                              className="rounded border px-2 py-1"
                              rows={1}
                              value={form.notes}
                              onChange={handleInput}
                            />
                            <div className="flex justify-between mt-1">
                              <button
                                type="submit"
                                className="bg-green-400 text-white px-3 py-1 rounded shadow font-bold"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="text-gray-500 font-semibold"
                                onClick={() => setEditJob(null)}
                              >
                                Cancel
                              </button>
                            </div>
                            {error && <div className="text-red-500">{error}</div>}
                            {msg && <div className="text-green-600">{msg}</div>}
                          </form>
                        ) : (
                          <Draggable
                            key={job.id}
                            draggableId={job.id!}
                            index={idx}
                          >
                            {(provided, snapshot) => (
                              <div
                                className={`bg-white rounded-xl p-3 mb-2 shadow border-2 flex flex-col gap-2 relative border-transparent hover:border-purple-200 transition group`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                {/* Drag handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute -top-3 left-1 z-20 p-1 cursor-grab opacity-60 group-hover:opacity-100"
                                  title="Drag card"
                                >
                                  <GripVertical className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex items-center gap-2 text-pink-400 font-bold text-lg mb-1">
                                  <Briefcase className="w-5 h-5" />
                                  {job.position}
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                  <FileText className="w-5 h-5 text-blue-400" />
                                  {job.company}
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                  <Calendar className="w-5 h-5 text-green-400" />
                                  {new Date(job.appliedDate).toLocaleDateString()}
                                </div>
                                {job.notes && (
                                  <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                                    <StickyNote className="w-5 h-5 text-yellow-400" />
                                    {job.notes}
                                  </div>
                                )}
                                {/* Avatar + Actions */}
                                <div className="flex items-center justify-between mt-1">
                                  <span className="flex items-center gap-1">
                                    {job.avatarUrl ? (
                                      <img
                                        src={job.avatarUrl}
                                        alt="avatar"
                                        className="w-7 h-7 rounded-full border-2 border-purple-200"
                                      />
                                    ) : (
                                      <UserCircle2 className="w-7 h-7 text-gray-300" />
                                    )}
                                    <span className="ml-2 text-xs text-gray-400">{job.company[0]}</span>
                                  </span>
                                  <span className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                      title="Edit"
                                      className="p-1 hover:bg-blue-100 rounded"
                                      onClick={() => startEdit(job)}
                                    >
                                      <Pencil className="w-4 h-4 text-blue-400" />
                                    </button>
                                    <button
                                      title="Delete"
                                      className="p-1 hover:bg-red-100 rounded"
                                      onClick={() => handleDelete(job.id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default KanbanBoard;
