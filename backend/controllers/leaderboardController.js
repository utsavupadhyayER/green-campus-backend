// controllers/leaderboardController.js
import User from "../models/userModel.js";

/**
 * GET /api/leaderboard
 * Query:
 *   - limit (optional) number of users to return (default 10, max 100)
 */
export const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "10", 10) || 10, 100);

    // Only students
    const users = await User.find({ role: "student" })
      .select("full_name avatar_url volunteer_points role")
      .sort({ volunteer_points: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
