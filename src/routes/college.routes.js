const express = require("express");
const protect = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

const {
  createCollege,
  getColleges,
  getCollegeBySlug,
  getCollegesForComparison,
  updateCollege,
  deleteCollege
} = require("../controllers/college.controller");

// Admin routes
router.post("/", protect, isAdmin, upload.single("image"), createCollege);
router.put("/:id", protect, isAdmin, upload.single("image"),updateCollege);
router.delete("/:id", protect, isAdmin, deleteCollege);

// Public routes
router.get("/compare", getCollegesForComparison);
router.get("/", getColleges);
router.get("/:slug", getCollegeBySlug);

module.exports = router;
