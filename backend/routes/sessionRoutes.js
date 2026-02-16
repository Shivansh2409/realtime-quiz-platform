const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Create a new session
router.post('/', sessionController.createSession);

// Get session by code
router.get('/code/:code', sessionController.getSessionByCode);

// Get session by ID
router.get('/:id', sessionController.getSessionById);

// Get session results/leaderboard
router.get('/:id/results', sessionController.getSessionResults);

// End a session
router.put('/:id/end', sessionController.endSession);

// Generate QR code for session
router.get('/:id/qr', sessionController.generateQRCode);

module.exports = router;
