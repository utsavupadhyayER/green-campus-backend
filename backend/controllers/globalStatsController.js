// controllers/globalStatsController.js
// returns array of { data_type, value } for normalization on frontend
export const getGlobalStats = async (req, res) => {
  try {
    // TODO: replace these static values with real remote API calls if available
    const stats = [
      { data_type: "food_waste", value: 1300000000 },      // tons/year
      { data_type: "hunger_deaths", value: 9000000 },      // deaths/year
      { data_type: "ewaste_pollution", value: 53600000 },  // tons CO2/year
    ];

    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("global-stats error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
