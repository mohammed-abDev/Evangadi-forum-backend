// Dependencies
const dbConection = require('../db/config');
const bcrypt = require('bcrypt');
const {StatusCodes} = require('http-status-codes');
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
}

//============ Login Controller ============//
const login = async (req, res) => {
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
            token: token,
            username :username,
            userid :userid
        });

    }catch(error){
        // console.log(error.message);
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
}

//============ user avater Controller ============//
const updateAvatar = async (req, res) => {
    const userid = req.user.userid;

    if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "No file uploaded" });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    try {
        await dbConection.query(
        "UPDATE usertable SET avatar = ? WHERE userid = ?",
        [avatarPath, userid]
    );

        res.status(StatusCodes.OK).json({
        message: "Avatar updated successfully",
        avatar: avatarPath,
    });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Avatar update failed" });
    }
};

//getProfile/userController.js
const getProfile = async (req, res) => {
    const userid = req.user.userid;
    try {
        const [userData] = await dbConection.query(
        `SELECT u.userid, u.username, u.avatar, u.bio,
                (SELECT COUNT(*) FROM questiontable q WHERE q.userid = u.userid) AS question_count,
                (SELECT COUNT(*) FROM answertable a WHERE a.userid = u.userid) AS answer_count
            FROM usertable u
            WHERE u.userid = ?`,
        [userid]
    );

        res.status(StatusCodes.OK).json(userData[0]);
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch profile" });
    }
};

const updateProfile = async (req, res) => {
    const { bio } = req.body;
    const userid = req.user.userid;

    try {
        await dbConection.query("UPDATE usertable SET bio = ? WHERE userid = ?", [
        bio,
        userid,
    ]);

    res.json({ message: "Profile updated" });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};



module.exports = {
    register,
    login,
    checkUser,
    updateAvatar,
    getProfile,
    updateProfile,
};