const Quiz = require("../models/Quiz");

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions, defaultTimerDuration } = req.body;

    const quiz = new Quiz({
      title,
      description,
      questions: questions || [],
      defaultTimerDuration: defaultTimerDuration || 30,
      createdBy: req.user._id,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    console.log(req.user._id);
    const quizzes = await Quiz.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add question to quiz
exports.addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const { text, options, correctAnswer, timerDuration } = req.body;
    quiz.questions.push({
      text,
      options,
      correctAnswer,
      timerDuration: timerDuration || quiz.defaultTimerDuration,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update question in quiz
exports.updateQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const question = quiz.questions.id(req.params.questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    Object.assign(question, req.body);
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete question from quiz
exports.deleteQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    quiz.questions.pull(req.params.questionId);
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
