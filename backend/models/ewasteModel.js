import mongoose from "mongoose";

const ewasteSchema = new mongoose.Schema({
  posted_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  item_type: { type: String, enum: ["mobile","laptop","charger","tablet","other"], required: true },
  quantity: Number,
  condition: String,
  location: String,
  description: String,
  status: { type: String, enum: ["available","claimed","completed"], default: "available" },
  claimed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  co2_saved_kg: { type: Number, default: 0 },
  image_url: String
}, { timestamps: true });

export default mongoose.model("EwastePost", ewasteSchema);
