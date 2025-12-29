// Import database connection
const dbConnection = require("../db/config");
// Import status codes
const { StatusCodes } = require("http-status-codes");
// Import UUID for unique question IDs
const { v4: uuidv4 } = require("uuid");


//============ Get All Questions Controller ============//
const getAllQuestions = async (req, res) => {
    // //res.send("success get all questions");
    try {
        const [questions] = await dbConnection.query('select questionid, id, title, description, created_at from questiontable order by created_at desc')
        return res.status(StatusCodes.OK).json({
            questions: questions
        });

    }catch(error){
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error",
            message: "An unexpected error occurred.",
        });
    }
}

//============ Get Question By ID Controller ============//
const getQuestionById = async(req, res) => {
    // //res.send("success get specific question ");
    const {question_id} = req.params;
    try{
        const [questions] = await dbConnection.query(
            'select questionid,id, title, description, userid, created_at from questiontable where questionid = ?',
            [question_id]
        )
        // Check if question exists
        if(questions.length === 0){
            return res.status(StatusCodes.NOT_FOUND).json({
                error: "Not Found",
                message: "The requested question could not be found.",
            });
        }

        return res.status(StatusCodes.OK).json({
            question: questions[0]
        });

    }catch(error){
        console.log(error.sqlMessage);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error",
            message: "An unexpected error occurred.",
        });
    }
}

//============ Create Question Controller ============//
const createQuestion = async (req, res) => {
    // //res.send("Question created successfully ");
    const {title, description} = req.body;
    const userid = req.user.userid; // comes from authMiddleware

    // Validate required fields
    if(!title || !description){
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: "Bad Request",
            message: "Please provide title and description",
        });
    }

    // Generate unique question ID
    const questionid = uuidv4();

    try{
        // Insert new question into the database
        await dbConnection.query(

            "insert into questiontable (questionid, title, description, userid) values (?, ?, ?, ?)",
            [questionid, title, description, userid]
        );  
        return res.status(StatusCodes.CREATED).json({
            message: "Question created successfully",
            question_id: questionid
        });

    }catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error",
            message: "An unexpected error occurred.",
        });
    }
}

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion
}
