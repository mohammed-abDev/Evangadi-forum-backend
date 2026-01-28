const express = require('express');
const router = express.Router();

//auth middleware
const authMiddleware = require('../middleware/authmiddleware')
const upload = require("../uploads/upload");

const {
    register, 
    login, 
    checkUser,
    updateAvatar,
    getProfile ,
    updateProfile
} = require('../controllers/userControllers');

//Post register user route
router.post('/register',register);

//Post login user route
router.post("/login", login);

//Get check auth user route with auth middleware
router.get("/checkUser", authMiddleware, checkUser);

// Get current user profile
router.get("/me", authMiddleware, getProfile);

// Update user profile
router.put("/profile", authMiddleware, updateProfile);

// Upload or update avatar
router.post("/avatar", authMiddleware, upload.single("avatar"), updateAvatar);

module.exports = router;