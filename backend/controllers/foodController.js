// controllers/foodController.js
import FoodPost from "../models/foodModel.js";
import Impact from "../models/impactModel.js";

// helper: update impact stats for meals/waste
async function updateImpactMeals(meals = 0, wasteKg = 0, delta = 1) {
  // delta should be +1 to add, -1 to subtract
  try {
    let stats = await Impact.findOne().sort({ createdAt: -1 });
    if (!stats) stats = await Impact.create({});

    // ensure numeric
    const addMeals = Number(meals) || 0;
    const addWaste = Number(wasteKg) || 0;

    stats.total_meals_saved = (stats.total_meals_saved || 0) + addMeals * delta;
    stats.total_food_waste_kg = (stats.total_food_waste_kg || 0) + addWaste * delta;

    // prevent negative numbers
    if (stats.total_meals_saved < 0) stats.total_meals_saved = 0;
    if (stats.total_food_waste_kg < 0) stats.total_food_waste_kg = 0;

    await stats.save();
    return stats;
  } catch (err) {
    // don't throw - log and continue (so impact failures don't block main flow)
    console.error("Impact update error:", err);
    return null;
  }
}

// ==========================
// GET ALL FOOD
// ==========================
export const getAllFood = async (req, res) => {
  try {
    const foods = await FoodPost.find()
      .populate("posted_by", "full_name role")
      .populate("claimed_by", "full_name role");

    res.json(foods);
  } catch (err) {
    console.error("Get all food error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// CREATE FOOD
// ==========================
export const createFood = async (req, res) => {
  try {
    const created = await FoodPost.create({
      ...req.body,
      posted_by: req.user._id,
    });

    const populated = await FoodPost.findById(created._id).populate(
      "posted_by",
      "full_name role"
    );

    // Note: we DO NOT update Impact on creation. Impact updates when food is claimed (meals saved).
    res.status(201).json(populated);
  } catch (err) {
    console.error("Error creating food:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// CLAIM FOOD
// ==========================
export const claimFood = async (req, res) => {
  try {
    const food = await FoodPost.findById(req.params.id);

    if (!food) return res.status(404).json({ message: "Food post not found" });
    if (food.status !== "available")
      return res.status(400).json({ message: "Already claimed or completed" });

    food.status = "claimed";
    food.claimed_by = req.user._id;

    await food.save();

    // update impact: add meals_saved and optionally approx waste kg (if provided)
    // expecting model has meals_saved and maybe quantity; adjust as required
    await updateImpactMeals(food.meals_saved || 0, food.quantity || 0, +1);

    const populated = await FoodPost.findById(food._id)
      .populate("posted_by", "full_name role")
      .populate("claimed_by", "full_name role");

    res.json(populated);
  } catch (err) {
    console.error("Claim error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// UPDATE FOOD
// ==========================
export const updateFood = async (req, res) => {
  try {
    const food = await FoodPost.findById(req.params.id);

    if (!food) return res.status(404).json({ message: "Food post not found" });
    if (food.posted_by.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // If the updater changes meals_saved or quantity AND the post is already claimed,
    // we should reflect the difference in Impact. We'll compute that safely.
    const wasClaimed = food.status === "claimed";
    const oldMealsSaved = Number(food.meals_saved || 0);
    const oldQuantity = Number(food.quantity || 0);

    await FoodPost.findByIdAndUpdate(req.params.id, req.body, { new: true });

    const updated = await FoodPost.findById(req.params.id)
      .populate("posted_by", "full_name role");

    // If the post was already claimed, adjust impact by the delta (updated - old)
    if (wasClaimed) {
      const newMealsSaved = Number(updated.meals_saved || 0);
      const newQuantity = Number(updated.quantity || 0);

      const mealsDelta = newMealsSaved - oldMealsSaved;
      const wasteDelta = newQuantity - oldQuantity;

      if (mealsDelta !== 0 || wasteDelta !== 0) {
        // delta may be negative or positive
        await updateImpactMeals(Math.abs(mealsDelta), Math.abs(wasteDelta), Math.sign(mealsDelta || wasteDelta));
      }
    }

    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// DELETE FOOD
// ==========================
export const deleteFood = async (req, res) => {
  try {
    const food = await FoodPost.findById(req.params.id);

    if (!food) return res.status(404).json({ message: "Food post not found" });
    if (food.posted_by.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // If the post was claimed, subtract its contribution from Impact to keep numbers correct
    if (food.status === "claimed") {
      await updateImpactMeals(food.meals_saved || 0, food.quantity || 0, -1);
    }

    await food.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
