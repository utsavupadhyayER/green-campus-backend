import mongoose from "mongoose";

const impactSchema = new mongoose.Schema({
  total_meals_saved: { type: Number, default: 0 },
  total_food_waste_kg: { type: Number, default: 0 },
  total_ewaste_items: { type: Number, default: 0 },
  total_co2_saved_kg: { type: Number, default: 0 },
  total_volunteers_active: { type: Number, default: 0 },
  total_donations: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Impact", impactSchema);
