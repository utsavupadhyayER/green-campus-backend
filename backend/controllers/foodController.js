import FoodPost from "../models/foodModel.js";

// ==========================
// GET ALL FOOD
// ==========================
export const getAllFood = async (req, res) => {
  const foods = await FoodPost.find()
    .populate("posted_by", "full_name role")
    .populate("claimed_by", "full_name role");

  res.json(foods);
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

    const populated = await FoodPost.findById(created._id)
      .populate("posted_by", "full_name role");

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

    await FoodPost.findByIdAndUpdate(req.params.id, req.body);

    const updated = await FoodPost.findById(req.params.id)
      .populate("posted_by", "full_name role");

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

    await food.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
