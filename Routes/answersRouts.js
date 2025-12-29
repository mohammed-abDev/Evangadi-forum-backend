const express = require('express');
const router = express.Router();
// Import auth middleware
const authMiddleware = require("../middleware/authmiddleware");

const {getAnswerByQId, postAnswer} = require('../controllers/answersController');

// Get answer by specific question ID
router.get("/:question_id", authMiddleware, getAnswerByQId);

// Post Submits an answer for a specific question.
router.post('/', authMiddleware, postAnswer);

module.exports = router;