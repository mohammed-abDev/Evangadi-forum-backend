const express = require('express');
const router = express.Router();
// Import auth middleware
const authMiddleware = require('../middleware/authmiddleware');

const {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    searchQuestions,
} = require("../controllers/questionsController");

// Get all questions
router.get("/", authMiddleware, getAllQuestions);

// Search questions (specific path first!)
router.get("/search", searchQuestions);

// Get one question by ID (dynamic path after)
router.get("/:question_id", authMiddleware, getQuestionById);

// Create a new question
router.post("/", authMiddleware, createQuestion);

// Update an existing question
router.put("/:question_id", authMiddleware, updateQuestion);


module.exports = router;