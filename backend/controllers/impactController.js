import Impact from "../models/impactModel.js";

export const getImpactStats = async (req, res) => {
  // Return the latest impact stats
  let stats = await Impact.findOne().sort({ createdAt: -1 });
  if (!stats) stats = await Impact.create({});
  res.json(stats);
};
