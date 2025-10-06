import VolunteerEvent from "../models/volunteerModel.js";

export const getAllVolunteers = async (req, res) => {
  const events = await VolunteerEvent.find().populate("created_by");
  res.json(events);
};

export const createVolunteer = async (req, res) => {
  const event = await VolunteerEvent.create({ ...req.body, created_by: req.user._id });
  res.json(event);
};
