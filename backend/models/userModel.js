import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "ngo", "admin", "mess_staff"],
      default: "student",
    },

    volunteer_points: { type: Number, default: 0 },
    avatar_url: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ volunteer_points: -1 });

export default mongoose.model("User", userSchema);
