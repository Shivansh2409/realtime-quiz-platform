const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const quizController = require("../controllers/quizController");

// Create a new quiz
router.post("/", authMiddleware, quizController.createQuiz);

// Get all quizzes (public)
router.get("/", authMiddleware, quizController.getAllQuizzes);

// Get a specific quiz (public)
router.get("/:id", quizController.getQuizById);

// Update a quiz
router.put("/:id", authMiddleware, quizController.updateQuiz);

// Delete a quiz
router.delete("/:id", authMiddleware, quizController.deleteQuiz);

// Add question to quiz
router.post("/:id/questions", authMiddleware, quizController.addQuestion);

// Update question in quiz
router.put(
  "/:id/questions/:questionId",
  authMiddleware,
  quizController.updateQuestion,
);

// Delete question from quiz
router.delete(
  "/:id/questions/:questionId",
  authMiddleware,
  quizController.deleteQuestion,
);

module.exports = router;
