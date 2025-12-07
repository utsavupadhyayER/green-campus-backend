import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

// Email regex — good real-world validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Password regex (min 6 chars, contains number)
const passwordRegex = /^(?=.*[0-9]).{6,}$/;

// REGISTER
export const registerUser = async (req, res) => {
  const { full_name, email, password, role } = req.body;

  try {
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and contain a number",
      });
    }

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password: hashed,
      role,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const cleanUser = await User.findById(user._id).select("-password");

    res.json({ token, user: cleanUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const cleanUser = await User.findById(user._id).select("-password");

    res.json({ token, user: cleanUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CURRENT USER
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};
