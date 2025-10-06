import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  item_name: String,
  category: { type: String, enum: ["books","clothes","stationery","electronics","other"] },
  condition: { type: String, enum: ["new","good","fair"] },
  quantity: Number,
  description: String,
  location: String,
  status: { type: String, enum: ["available","claimed","completed"], default: "available" },
  claimed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  image_url: String
}, { timestamps: true });

export default mongoose.model("Donation", donationSchema);
