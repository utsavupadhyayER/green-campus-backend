import EwastePost from "../models/ewasteModel.js";

// =======================
// GET ALL E-WASTE POSTS
// =======================
export const getAllEwaste = async (req, res) => {
  try {
    const items = await EwastePost.find()
      .populate("posted_by", "full_name email role")
      .populate("claimed_by", "full_name email role");

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

    res.status(201).json({
      success: true,
      data: item,
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

    const post = await EwastePost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.status !== "available") {
      return res.status(400).json({ message: "Item already claimed or completed" });
    }

    post.status = "claimed";
    post.claimed_by = req.user._id;

    await post.save();

    res.status(200).json({
      message: "Pickup Scheduled",
      data: post,
    });

  } catch (err) {
    console.error("Claim error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// =======================
// UPDATE E-WASTE
// =======================
export const updateEwaste = async (req, res) => {
  try {
    const id = req.params.id;

    const post = await EwastePost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only creator can update
    if (post.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    const updated = await EwastePost.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
      message: "Updated successfully",
      data: updated,
    });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// =======================
// DELETE E-WASTE
// =======================
export const deleteEwaste = async (req, res) => {
  try {
    const id = req.params.id;

    const post = await EwastePost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only poster can delete
    if (post.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
