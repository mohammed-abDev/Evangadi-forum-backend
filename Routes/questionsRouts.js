const express = require('express');
const router = express.Router();
// Import auth middleware
const authMiddleware = require('../middleware/authmiddleware');

const { getAllQuestions,getQuestionById,createQuestion} = require('../controllers/questionsController');

//Get all questions route
router.get("/",authMiddleware, getAllQuestions);

//Get Retrieves details of a specific question route
router.get("/:question_id", authMiddleware, getQuestionById);

//Post Creates a new question route
router.post("/",authMiddleware, createQuestion);

module.exports = router;