// Import database connection
const dbConection = require('../db/config');
//Import bcrypt for password hashing
const bcrypt = require('bcrypt');
// Import status codes
const {StatusCodes} = require('http-status-codes');
// Import jsonwebtoken for token generation
const jws = require('jsonwebtoken');


//============ Register Controller ============//
const register = async(req, res) => {
    const {username, firstname, lastname, email, password} = req.body;
    if(!username || !firstname || !lastname || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: "Bad Request",
            message: "Please provide all required fields",
        });
    }
    try{
        const [userExists] = await dbConection.query(
            'select username,userid from usertable where username = ? or email = ?',
            [username,email]
        )
        //// res.json({userExists: userExists});

        // Check if user with same username or email already exists
        if(userExists.length > 0){
            return res.status(StatusCodes.CONFLICT).json({
                error: "Conflict",
                message: "Username or Email already exists",
            })
        }
        
        // Validate password length
        if(password.length <= 8){
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: "Bad Request",
                message: "Password must be at least 8 characters long"
            })
        }
        
        // Generate salt and hash before storing password
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);

        // Insert new user into the database
        await dbConection.query(
            'Insert into usertable (username, firstname, lastname, email, password) values (?,?,?,?,?)',
            [username,firstname,lastname,email,hashpassword]
        );
            return res.status(StatusCodes.CREATED).json({
                message: "User registered successfully"
            }
        )

    }catch(error){
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error:"intenal server error",
            message:error.message
        })
    }
    //// res.send('success register route');
}

//============ Login Controller ============//
const login = async (req, res) => {
    //// res.send('success login route');
    const {email, password} = req.body;
    // Check if email and password are provided
    if(!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: "Bad Request",
            message: "Please provide email and password",
        });
    }
    try{
        // Find user by email
        const [userExists] = await dbConection.query(
            'select username, userid, password from usertable where email = ? ',
            [email]
        )
        // Check if user with the provided email exists
        if (userExists.length === 0){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: "Unauthorized",
                message: "Invalid credintials [email or password]",
            })
        }
        // Compare provided password with stored hashed password
        const isPasswordMatch = await bcrypt.compare(password, userExists[0].password);
        if(!isPasswordMatch){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: "Unauthorized",
                message: "Invalid credintials [email or password]",
            })
        }
        // Generate JWT token upon successful authentication
        const username = userExists[0].username;
        const userid = userExists[0].userid;
        const token = jws.sign(
            {username, userid},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );

        return res.status(StatusCodes.OK).json({
            message: "Login successful",
            token: token
        });

    }catch(error){
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error",
            message: "An unexpected error occurred.",
        });
    }
}

//============ Check User Controller ============//
const checkUser = (req, res) => {
    const username = req.user.username;
    const userid = req.user.userid;
    return res.status(StatusCodes.OK).json({
        message: 'valid user',
        user:{username, userid}
    })
    //// res.send('success check user route');
}

module.exports = { register, login, checkUser };