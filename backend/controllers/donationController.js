// controllers/donationController.js
import Donation from "../models/donationModel.js";
import mongoose from "mongoose";

/* ===========================================
   HELPERS
   =========================================== */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/* ===========================================
   GET ALL DONATIONS
   =========================================== */
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donated_by", "full_name email role")
      .populate("claimed_by", "full_name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: donations });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================================
   CREATE DONATION
   =========================================== */
export const createDonation = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const newDonation = await Donation.create({
      ...req.body,
      donated_by: req.user._id,
    });

    const populated = await Donation.findById(newDonation._id).populate(
      "donated_by",
      "full_name email role"
    );

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("Error creating donation:", error);
    return res.status(400).json({ success: false, message: "Invalid donation data" });
  }
};

/* ===========================================
   CLAIM DONATION
   - Any authenticated user can claim an available item.
   - Optionally prevent donor from claiming their own item (see comment).
   =========================================== */
export const claimDonation = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation id" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    if (donation.status !== "available") {
      return res.status(400).json({ success: false, message: "Item already claimed" });
    }

    // Optional: prevent donor from claiming their own donation
    // if (donation.donated_by.toString() === req.user._id.toString()) {
    //   return res.status(400).json({ success: false, message: "Donor cannot claim own item" });
    // }

    donation.status = "claimed";
    donation.claimed_by = req.user._id;
    await donation.save();

    const updated = await Donation.findById(id)
      .populate("donated_by", "full_name email role")
      .populate("claimed_by", "full_name email role");

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Claim error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================================
   UNCLAIM DONATION
   - Only the claimer, donor, or admin can unclaim
   =========================================== */
export const unclaimDonation = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation id" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    // Authorization: only claimer, donor, or admin can unclaim
    const requesterId = req.user._id.toString();
    const isClaimer = donation.claimed_by && donation.claimed_by.toString() === requesterId;
    const isDonor = donation.donated_by && donation.donated_by.toString() === requesterId;
    const isAdmin = req.user.role === "admin";

    if (!isClaimer && !isDonor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to unclaim this item" });
    }

    donation.status = "available";
    donation.claimed_by = null;
    await donation.save();

    const updated = await Donation.findById(id)
      .populate("donated_by", "full_name email role")
      .populate("claimed_by", "full_name email role");

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Unclaim error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
