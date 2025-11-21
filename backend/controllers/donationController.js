import Donation from "../models/donationModel.js";

/* ===========================================
   GET ALL DONATIONS
=========================================== */
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donated_by")
      .populate("claimed_by")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================================
   CREATE DONATION
=========================================== */
export const createDonation = async (req, res) => {
  try {
    const newDonation = await Donation.create({
      ...req.body,
      donated_by: req.user._id,
    });

    const populated = await Donation.findById(newDonation._id)
      .populate("donated_by");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(400).json({ message: "Invalid donation data" });
  }
};

/* ===========================================
   CLAIM DONATION
=========================================== */
export const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status !== "available") {
      return res.status(400).json({ message: "Item already claimed" });
    }

    donation.status = "claimed";
    donation.claimed_by = req.user._id;

    await donation.save();

    const updated = await Donation.findById(req.params.id)
      .populate("donated_by")
      .populate("claimed_by");

    res.json(updated);
  } catch (error) {
    console.error("Claim error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================================
   UNCLAIM DONATION
=========================================== */
export const unclaimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    donation.status = "available";
    donation.claimed_by = null;

    await donation.save();

    const updated = await Donation.findById(req.params.id)
      .populate("donated_by")
      .populate("claimed_by");

    res.json(updated);
  } catch (error) {
    console.error("Unclaim error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
