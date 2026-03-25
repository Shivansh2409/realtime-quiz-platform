const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const sessionController = require("../controllers/sessionController");

// Create a new session
router.post("/", authMiddleware, sessionController.createSession);

// Get session by code (public)
router.get("/code/:code", sessionController.getSessionByCode);

// Get session by ID (public)
router.get("/:id", sessionController.getSessionById);

// Get session results/leaderboard (public)
router.get("/:id/results", sessionController.getSessionResults);

// End a session
router.put("/:id/end", authMiddleware, sessionController.endSession);

// Generate QR code for session (public)
router.get("/:id/qr", sessionController.generateQRCode);

module.exports = router;
