// controllers/ewasteController.js
import EwastePost from "../models/ewasteModel.js";
import Impact from "../models/impactModel.js";
import mongoose from "mongoose";

// Helper: atomically increment / decrement impact counters
async function incImpactEwaste(itemsDelta = 0, co2DeltaKg = 0) {
  try {
    // Use findOneAndUpdate with upsert: true so a document exists
    const update = {};
    if (itemsDelta) update.$inc = { total_ewaste_items: itemsDelta };
    if (co2DeltaKg) {
      update.$inc = update.$inc || {};
      update.$inc.total_co2_saved_kg = co2DeltaKg;
    }

    if (!update.$inc) return null; // nothing to do

    const stats = await Impact.findOneAndUpdate(
      {},
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Prevent negative values by clamping (best-effort)
    const changed = {};
    if (stats.total_ewaste_items < 0) changed.total_ewaste_items = 0;
    if (stats.total_co2_saved_kg < 0) changed.total_co2_saved_kg = 0;
    if (Object.keys(changed).length) {
      Object.assign(stats, changed);
      await stats.save();
    }

    return stats;
  } catch (err) {
    console.error("Impact inc error:", err);
    return null;
  }
}

// =======================
// GET ALL E-WASTE POSTS
// =======================
export const getAllEwaste = async (req, res) => {
  try {
    const items = await EwastePost.find()
      .populate("posted_by", "full_name email role")
      .populate("claimed_by", "full_name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// CREATE E-WASTE POST
// =======================
export const createEwaste = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const item = await EwastePost.create({
      ...req.body,
      posted_by: req.user._id,
    });

    const populated = await EwastePost.findById(item._id)
      .populate("posted_by", "full_name email role");

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    console.error("Create error:", err);
    res.status(400).json({
      success: false,
      message: "Invalid data or missing fields",
    });
  }
};

// =======================
// CLAIM E-WASTE
// =======================
export const claimEwaste = async (req, res) => {
  try {
    const id = req.params.id;

    // validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const post = await EwastePost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.status !== "available") {
      return res.status(400).json({ success: false, message: "Item already claimed or completed" });
    }

    post.status = "claimed";
    post.claimed_by = req.user._id;

    await post.save();

    // Update impact: increment total_ewaste_items by quantity and total_co2_saved_kg by co2_saved_kg
    const qty = Number(post.quantity || 0);
    const co2 = Number(post.co2_saved_kg || 0);
    await incImpactEwaste(qty, co2);

    const populated = await EwastePost.findById(post._id)
      .populate("posted_by", "full_name email role")
      .populate("claimed_by", "full_name email role");

    res.status(200).json({
      success: true,
      message: "Pickup Scheduled",
      data: populated,
    });
  } catch (err) {
    console.error("Claim error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =======================
// UPDATE E-WASTE
// =======================
export const updateEwaste = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const post = await EwastePost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    // Only creator can update
    if (post.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this post" });
    }

    // If post is already claimed, compute delta for impact (new - old)
    const wasClaimed = post.status === "claimed";
    const oldQty = Number(post.quantity || 0);
    const oldCo2 = Number(post.co2_saved_kg || 0);

    const updated = await EwastePost.findByIdAndUpdate(id, req.body, { new: true });

    // If it was claimed, adjust Impact by the delta (could be negative or positive)
    if (wasClaimed) {
      const newQty = Number(updated.quantity || 0);
      const newCo2 = Number(updated.co2_saved_kg || 0);

      const qtyDelta = newQty - oldQty;
      const co2Delta = newCo2 - oldCo2;

      if (qtyDelta !== 0 || co2Delta !== 0) {
        // Use incImpactEwaste with positive or negative values
        await incImpactEwaste(qtyDelta, co2Delta);
      }
    }

    const populated = await EwastePost.findById(updated._id)
      .populate("posted_by", "full_name email role")
      .populate("claimed_by", "full_name email role");

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: populated,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =======================
// DELETE E-WASTE
// =======================
export const deleteEwaste = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const post = await EwastePost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    // Only poster can delete
    if (post.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
    }

    // If the post was claimed, subtract its contribution from Impact so totals stay correct
    if (post.status === "claimed") {
      const qty = Number(post.quantity || 0);
      const co2 = Number(post.co2_saved_kg || 0);
      // subtract by passing negative increments
      await incImpactEwaste(-qty, -co2);
    }

    await post.deleteOne();

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
