// Dependencies
const dbConnection = require("../db/config");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("openai");
const { v4: uuidv4 } = require("uuid");


//============ Get All Questions Controller ============//
const getAllQuestions = async (req, res) => {
    try {
        const [questions] = await dbConnection.query(
          `
    SELECT
        q.questionid,
        q.id,
        q.title,
        q.description,
        q.tag,
        q.created_at,
        u.username,
        u.avatar,
        u.bio,
        
        COUNT(DISTINCT a.answerid) AS answer_count,
        COALESCE(SUM(CASE WHEN ar.reaction = 'like' THEN 1 END), 0) AS like_count,
        COALESCE(SUM(CASE WHEN ar.reaction = 'dislike' THEN 1 END), 0) AS dislike_count

    FROM questiontable q
    INNER JOIN usertable u
        ON q.userid = u.userid
    LEFT JOIN answertable a
        ON q.questionid = a.questionid
    LEFT JOIN answer_reactions ar
        ON a.answerid = ar.answer_id
    GROUP BY
        q.questionid,
        q.id,
        q.title,
        q.description,
        q.tag,
        q.created_at,
        u.username,
        u.avatar,
        u.bio

    ORDER BY q.created_at DESC;
        `,
        );
    res.status(StatusCodes.OK).json({
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
    const {question_id} = req.params;
    try{
        const [questions] = await dbConnection.query(
            `
            SELECT
                q.questionid,
                q.id,
                q.title,
                q.description,
                q.created_at,
                u.userid,
                u.username,
                u.avatar,
                u.bio
            FROM questiontable q
            JOIN usertable u
                ON q.userid = u.userid
            WHERE q.questionid = ?
            `,
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
    const {title, description,tag} = req.body;
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

            "insert into questiontable (questionid, title, description,tag, userid) values (?, ?, ?, ?,?)",
            [questionid, title, description,tag, userid]
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

/*============ Update Question Controller ============*/
const updateQuestion = async (req, res) => {
    const { question_id } = req.params;
    const { title, description, tag } = req.body;
    const userid = req.user.userid;

    try {
        const [existing] = await dbConnection.query(
            "SELECT userid FROM questiontable WHERE questionid = ?",
            [question_id]
        );
    
        if (existing.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Question not found" });
        }
    
        if (existing[0].userid !== userid) {
            return res.status(StatusCodes.NOT_IMPLEMENTED).json({ message: "Not allowed" });
        }
    
        await dbConnection.query(
            "UPDATE questiontable SET title=?, description=?, tag=? WHERE questionid=?",
            [title, description, tag, question_id]
        );
    
        res.json({ message: "Question updated successfully" });
    }   catch (error) {
        console.log(error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
};


// Search questions by title or body
const searchQuestions = async (req, res) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.status(400).json({ message: "Search query required" });
    }

    try {
        const [rows] = await dbConnection.query(
        `
        SELECT
            q.questionid,
            q.title,
            q.description,
            q.tag,
            q.created_at,
            u.username,
            u.avatar
        FROM questiontable q
        JOIN usertable u ON q.userid = u.userid
        WHERE q.title LIKE ? OR q.description LIKE ?
        ORDER BY q.created_at DESC
        `,
        [`%${q}%`, `%${q}%`],
    );

    res.status(200).json(rows);
    } catch (err) {
        console.error("Search error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Search failed" });
    }
};


module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    searchQuestions,
};
