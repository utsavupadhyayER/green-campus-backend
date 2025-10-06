import Donation from "../models/donationModel.js";

export const getAllDonations = async (req, res) => {
  const donations = await Donation.find().populate("donated_by").populate("claimed_by");
  res.json(donations);
};

export const createDonation = async (req, res) => {
  const donation = await Donation.create({ ...req.body, donated_by: req.user._id });
  res.json(donation);
};
