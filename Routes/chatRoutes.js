const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");
const { chatWithAI } = require("../controllers/chatController");

// POST → send message to AI
router.post("/", authMiddleware, chatWithAI);

module.exports = router;
