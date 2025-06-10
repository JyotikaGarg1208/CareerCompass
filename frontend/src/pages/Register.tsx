import React, { useState } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import axios from "axios";

const pastelColors = [
  "#f9c5d1", // pink
  "#b7eaff", // blue
  "#c1ffd7", // green
  "#fbe6a2", // yellow
  "#ffdeec", // lavender
];

const particlesInit = async (main: any) => {
  await loadFull(main);
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Register: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/auth/register`, form);
      setSuccess("Registration successful! 🎉");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Pastel Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true, zIndex: 0 },
          background: { color: "transparent" },
          fpsLimit: 60,
          particles: {
            color: { value: pastelColors },
            links: {
              enable: true,
              color: "#e4e7ef",
              distance: 120,
              opacity: 0.15,
              width: 1.2,
            },
            move: {
              enable: true,
              speed: 1.2,
              direction: "none",
              outModes: { default: "bounce" },
              random: false,
              straight: false,
            },
            number: { value: 38, density: { enable: true, area: 800 } },
            opacity: { value: 0.8 },
            shape: { type: "circle" },
            size: { value: { min: 5, max: 14 } },
            shadow: {
              enable: true,
              color: "#f9c5d1",
              blur: 5,
            },
          },
          detectRetina: true,
        }}
      />
      {/* Registration Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="z-10 w-full max-w-lg flex flex-col items-center"
      >
        <Card className="w-full max-w-md rounded-3xl shadow-2xl px-10 py-10 border-0 bg-white/70 backdrop-blur-2xl">
          <CardContent>
            <div className="flex flex-col items-center gap-2 mb-7">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.14, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <UserPlus className="text-pink-400 w-12 h-12" />
              </motion.div>
              <h1 className="text-3xl font-extrabold text-center mb-1 text-slate-700 drop-shadow-lg">
                Create your account
              </h1>
              <p className="text-muted-foreground text-center text-base text-gray-600 font-medium">
                JOB APPLICATION TRACKER </p><p><span className="text-pink-400">Easy</span>, <span className="text-blue-400">Analytical</span> and <span className="text-green-400">Fun</span>!
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              {error && (
                <motion.div
                  className="text-red-500 text-center text-sm"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  className="text-green-600 text-center text-sm"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {success}
                </motion.div>
              )}
              <Button className="w-full bg-pink-400 hover:bg-pink-500 transition rounded-2xl shadow-lg text-white text-lg font-bold py-2 mt-2">
                Register
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="mt-10 text-xs text-gray-400 text-center">
          <span>
            <span role="img" aria-label="sparkles">✨</span>
            Made By <span className="text-pink-300 font-bold">Jyotika Garg</span> •{" "}
            <span className="text-blue-300">Your Career, Your Vibe.</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
