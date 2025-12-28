const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access. Please log in." });
  }

  try {
    const tokenClean = token.replace("Bearer ", "");
    const decoded = jwt.verify(tokenClean, process.env.JWT_SECRET);

    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Geçersiz Token." });
  }
};