// Import database connection
const dbConnection = require("../db/config");
// Import status codes
const { StatusCodes } = require("http-status-codes");


//============ Get Answer By Question ID Controller ============//
const getAnswerByQId = async (req, res) => {
  const { question_id } = req.params;

  try {
    const [answers] = await dbConnection.query(
      "SELECT answerid, questionid, answer, created_at FROM answertable WHERE questionid = ? ORDER BY created_at DESC",
      [question_id]
    );

    // Check if answers exist
    if (answers.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested answers could not be found.",
      });
    }

    return res.status(StatusCodes.OK).json({
      answers: answers,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

//============ Post (Create) Answer Controller ============//
const postAnswer = async (req, res) => {
  const { questionid, answer } = req.body;
  const userid = req.user.userid; // comes from auth middleware
  const username = req.user.username;
  // Validate required fields
  
  if (!questionid || !answer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide answer",
    });
  }

  try {
    await dbConnection.query(
      "INSERT INTO answertable (userid, questionid, answer) VALUES (?, ?, ?)",
      [userid, questionid, answer]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Answer created successfully.",
      answer: {
        userid,
        questionid,
        answer,
        username,
        created_at: new Date(),
      },
    });
  }catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

module.exports = {
  getAnswerByQId,
  postAnswer,
};
