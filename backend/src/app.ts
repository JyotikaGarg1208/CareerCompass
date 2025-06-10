// backend/app.ts
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const app = express();

app.use(cors());
app.use(express.json());

const users: { name: string; email: string; password: string }[] = [];
const resetTokens: { [email: string]: { token: string; expires: number } } = {};

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    {res.status(400).json({ message: "All fields required." }); return;}

  if (users.find(u => u.email === email))
    {res.status(400).json({ message: "User already exists." }); return;}

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ name, email, password: hashedPassword });
  res.json({ message: "Registration successful!" });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user)
    {res.status(400).json({ message: "Invalid email or password." }); return;}

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    {res.status(400).json({ message: "Invalid email or password." }); return;}

  const token = jwt.sign(
    { email: user.email, name: user.name },
    process.env.JWT_SECRET || "SECRET_KEY",
    { expiresIn: "1h" }
  );
  res.json({ token });
});

// --- Forgot Password Request ---
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    // Always send the same response for security
    {res.json({ message: "If this email exists, reset instructions sent." }); return;}
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  resetTokens[email] = {
    token,
    expires: Date.now() + 1000 * 60 * 30 // valid for 30 mins
  };

  // In production, you'd send an email. For demo, print the reset link:
  const resetUrl = `http://localhost:5173/reset-password/${token}`;
  console.log(`Password reset link for ${email}: ${resetUrl}`);

  res.json({ message: "If this email exists, reset instructions sent." });
});

// --- Reset Password ---
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  // Find user by token
  const entry = Object.entries(resetTokens).find(([email, data]) =>
    data.token === token && data.expires > Date.now()
  );
  if (!entry) {
    res.status(400).json({ message: "Invalid or expired token." });
    return;
  }

  const [email] = entry;
  const user = users.find(u => u.email === email);
  if (!user) {
    res.status(400).json({ message: "User not found." });
    return;
  }

  user.password = await bcrypt.hash(password, 10);
  delete resetTokens[email];
  res.json({ message: "Password has been reset successfully." });
});



// PROTECTED DASHBOARD
app.get("/api/dashboard", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {res.status(401).json({ message: "No token provided." }); return;}

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "SECRET_KEY"
    ) as { name: string; email: string };
    res.json({ message: `Welcome, ${decoded.name}!`, email: decoded.email });
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
  }
});

export default app;
