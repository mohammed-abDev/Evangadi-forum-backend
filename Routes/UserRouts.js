const express = require('express');
const router = express.Router();
// Import auth middleware
const authMiddleware = require('../middleware/authmiddleware')

const {register, login, checkUser} = require('../controllers/userControllers');

//Post register user route
router.post('/register',register);

//Post login user route
router.post("/login", login);

//Get check auth user route with auth middleware
router.get("/checkUser", authMiddleware, checkUser);

module.exports = router;