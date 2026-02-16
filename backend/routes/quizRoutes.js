const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Create a new quiz
router.post('/', quizController.createQuiz);

// Get all quizzes
router.get('/', quizController.getAllQuizzes);

// Get a specific quiz
router.get('/:id', quizController.getQuizById);

// Update a quiz
router.put('/:id', quizController.updateQuiz);

// Delete a quiz
router.delete('/:id', quizController.deleteQuiz);

// Add question to quiz
router.post('/:id/questions', quizController.addQuestion);

// Update question in quiz
router.put('/:id/questions/:questionId', quizController.updateQuestion);

// Delete question from quiz
router.delete('/:id/questions/:questionId', quizController.deleteQuestion);

module.exports = router;
