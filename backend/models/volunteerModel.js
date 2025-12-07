// models/volunteerModel.js
import mongoose from "mongoose";

const registeredSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["registered","attended","absent"], default: "registered" },
  points_awarded: { type: Boolean, default: false },
  awarded_at: { type: Date }
}, { _id: false });

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
  points_reward: { type: Number, default: 0 }, // points per attendee
  image_url: String,
  status: { type: String, enum: ["upcoming","ongoing","completed","cancelled"], default: "upcoming" },
  registered: [registeredSchema]
}, { timestamps: true });

// helpful index for queries by date/status
volunteerSchema.index({ event_date: 1 });
volunteerSchema.index({ status: 1 });

export default mongoose.model("VolunteerEvent", volunteerSchema);
