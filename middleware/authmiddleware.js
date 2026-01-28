// Import status codes
const {StatusCodes} = require('http-status-codes');

// Import jsonwebtoken for token generation
const jws = require('jsonwebtoken');

// Authentication middleware to verify JWT tokens
async function authMiddleware(req, res, next){
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            Error: "Unauthorized [No token provided]",
            Message: "Autentication token is missing",
        })
    }
    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    try{
        // Verify token
        const data = jws.verify(token, process.env.JWT_SECRET);
        req.user = {username: data.username, userid: data.userid};
        next();// Token is valid, proceed to the next middleware or route handler

    }catch(error){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            Message: "Autentication invalid",
        });
    }
}

module.exports = authMiddleware;