import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema({
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  event_type: { type: String, enum: ["food_drive","ewaste_cleanup","awareness","tree_planting","other"] },
  location: String,
  latitude: Number,
  longitude: Number,
  event_date: Date,
  duration_hours: Number,
  max_volunteers: Number,
  registered_count: { type: Number, default: 0 },
  points_reward: Number,
  image_url: String,
  status: { type: String, enum: ["upcoming","ongoing","completed","cancelled"], default: "upcoming" }
}, { timestamps: true });

export default mongoose.model("VolunteerEvent", volunteerSchema);
