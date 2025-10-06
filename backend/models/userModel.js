import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "ngo", "admin", "mess_staff"], required: true },
  volunteer_points: { type: Number, default: 0 },
  avatar_url: { type: String },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
