// src/app.ts
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

/** ---- JWT Token Utilities ---- */
function signToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET || "SECRET_KEY", { expiresIn: "1d" });
}

function getUserFromAuth(authHeader?: string): { email: string; userId: string } | null {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY") as any;
    return { email: decoded.email, userId: decoded.userId };
  } catch {
    return null;
  }
}

/** ---- AUTH ---- */
// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    {res.status(400).json({ message: "All fields required." }); return;}

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {res.status(400).json({ message: "User already exists." }); return;}

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashedPassword }
  });
  res.json({ message: "Registration successful!" });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {res.status(400).json({ message: "Invalid email or password." }); return;}

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {res.status(400).json({ message: "Invalid email or password." }); return;}

  const token = signToken({ email: user.email, name: user.name, userId: user.id });
  res.json({ token });
});

/** ---- FORGOT/RESET PASSWORD (Demo, token in memory) ---- */
const resetTokens: { [email: string]: { token: string; expires: number } } = {};

// FORGOT PASSWORD
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Always respond generically
    res.json({ message: "If this email exists, reset instructions sent." });
    return;
  }
  const token = crypto.randomBytes(32).toString("hex");
  resetTokens[email] = {
    token,
    expires: Date.now() + 1000 * 60 * 30 // 30 mins
  };
  // In real app: send email; for now: print link
  const resetUrl = `http://localhost:5173/reset-password/${token}`;
  console.log(`Password reset link for ${email}: ${resetUrl}`);
  res.json({ message: "If this email exists, reset instructions sent." });
});

// RESET PASSWORD
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  // Find user by token
  const entry = Object.entries(resetTokens).find(([email, data]) =>
    data.token === token && data.expires > Date.now()
  );
  if (!entry) {res.status(400).json({ message: "Invalid or expired token." }); return;}
  const [email] = entry;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {res.status(400).json({ message: "User not found." }); return;}

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { email }, data: { password: hashed } });
  delete resetTokens[email];
  res.json({ message: "Password has been reset successfully." });
});

/** ---- JOB APPLICATION CRUD (All Protected) ---- */

// CREATE JOB APPLICATION
app.post("/api/jobs", async (req, res) => {
  const user = getUserFromAuth(req.headers.authorization);
  if (!user) {res.status(401).json({ message: "Unauthorized" }); return;}

  const { company, position, status, appliedDate, notes } = req.body;
  if (!company || !position || !status || !appliedDate)
    {res.status(400).json({ message: "All fields required." }); return;}

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!dbUser) {res.status(401).json({ message: "Unauthorized" }); return;}

  const job = await prisma.jobApplication.create({
    data: {
      userId: dbUser.id,
      company,
      position,
      status,
      appliedDate: new Date(appliedDate),
      notes,
    }
  });
  res.json({ message: "Job application added!", job });
});

// GET ALL MY JOB APPLICATIONS
app.get("/api/jobs", async (req, res) => {
  const user = getUserFromAuth(req.headers.authorization);
  if (!user) {res.status(401).json({ message: "Unauthorized" }); return;}

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!dbUser) {res.status(401).json({ message: "Unauthorized" }); return;}

  const jobs = await prisma.jobApplication.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(jobs);
});

// UPDATE JOB APPLICATION
app.put("/api/jobs/:id", async (req, res) => {
  const user = getUserFromAuth(req.headers.authorization);
  if (!user) {res.status(401).json({ message: "Unauthorized" }); return;}

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!dbUser) {res.status(401).json({ message: "Unauthorized" }); return;}

  const { id } = req.params;
  const { company, position, status, appliedDate, notes } = req.body;
  const job = await prisma.jobApplication.findUnique({ where: { id } });
  if (!job || job.userId !== dbUser.id) {res.status(404).json({ message: "Not found" }); return;}

  const updated = await prisma.jobApplication.update({
    where: { id },
    data: { company, position, status, appliedDate: new Date(appliedDate), notes }
  });
  res.json({ message: "Updated successfully!", job: updated });
});

// DELETE JOB APPLICATION
app.delete("/api/jobs/:id", async (req, res) => {
  const user = getUserFromAuth(req.headers.authorization);
  if (!user) {res.status(401).json({ message: "Unauthorized" }); return;}

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!dbUser) {res.status(401).json({ message: "Unauthorized" }); return;}

  const { id } = req.params;
  const job = await prisma.jobApplication.findUnique({ where: { id } });
  if (!job || job.userId !== dbUser.id) {res.status(404).json({ message: "Not found" }); return;}

  await prisma.jobApplication.delete({ where: { id } });
  res.json({ message: "Deleted successfully" });
});

/** ---- PROTECTED DASHBOARD (optional) ---- */
app.get("/api/dashboard", async (req, res) => {
  const user = getUserFromAuth(req.headers.authorization);
  if (!user) {res.status(401).json({ message: "Unauthorized" }); return;}

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!dbUser) {res.status(401).json({ message: "Unauthorized" }); return;}

  res.json({ message: `Welcome, ${dbUser.name}!`, email: dbUser.email });
});

export default app;
