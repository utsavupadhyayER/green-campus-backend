import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  posted_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  food_type: { type: String, required: true },
  quantity: { type: String, required: true },
  expiry_time: { type: Date, required: true },
  location: { type: String, required: true },
  description: String,
  status: { type: String, enum: ["available", "claimed", "completed"], default: "available" },
  claimed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  image_url: String,
  meals_saved: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("FoodPost", foodSchema);
