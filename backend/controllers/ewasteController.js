import EwastePost from "../models/ewasteModel.js";

export const getAllEwaste = async (req, res) => {
  const items = await EwastePost.find().populate("posted_by").populate("claimed_by");
  res.json(items);
};

export const createEwaste = async (req, res) => {
  const item = await EwastePost.create({ ...req.body, posted_by: req.user._id });
  res.json(item);
};
