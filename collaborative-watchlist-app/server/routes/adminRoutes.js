const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.use(authMiddleware, adminMiddleware);

router.get("/stats", adminController.getStats);
router.get("/reviews", adminController.getAllReviews);
router.get("/users", adminController.getAllUsers);
router.delete("/review/:id", adminController.deleteReview);
router.delete("/user/:id", adminController.deleteUser);

module.exports = router;