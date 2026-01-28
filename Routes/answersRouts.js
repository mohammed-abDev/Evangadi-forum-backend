const express = require('express');
const router = express.Router();
// Import auth middleware
const authMiddleware = require("../middleware/authmiddleware");

const {
    getAnswerByQId, 
    postAnswer, 
    updateAnswer, 
    deleteAnswer, 
    likeAnswer, 
    dislikeAnswer
} = require('../controllers/answersController');

// Get answer by specific question ID
router.get("/:question_id/answer", authMiddleware, getAnswerByQId);

// Post Submits an answer for a specific question.
router.post("/:question_id/answer", authMiddleware, postAnswer);

// Edit an answer
router.put("/answer/:answer_id", authMiddleware, updateAnswer);

// Delet an answer
router.delete("/answer/:answer_id", authMiddleware, deleteAnswer);

//Like an answer
router.post("/answer/:answer_id/like", authMiddleware, likeAnswer);

//disLike an answe
router.post("/answer/:answer_id/dislike", authMiddleware, dislikeAnswer);


module.exports = router;