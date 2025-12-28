const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Erişim reddedildi. Admin yetkisi gerekli." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Admin kontrolü sırasında hata." });
  }
};