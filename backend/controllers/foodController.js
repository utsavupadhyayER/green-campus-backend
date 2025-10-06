import FoodPost from "../models/foodModel.js";

export const getAllFood = async (req, res) => {
  const foods = await FoodPost.find().populate("posted_by").populate("claimed_by");
  res.json(foods);
};

export const createFood = async (req, res) => {
  const food = await FoodPost.create({ ...req.body, posted_by: req.user._id });
  res.json(food);
};
