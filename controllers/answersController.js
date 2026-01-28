// Dependencies
const dbConnection = require("../db/config");
const { StatusCodes } = require("http-status-codes");


//============ Get Answer By Question ID Controller ============//
const getAnswerByQId = async (req, res) => {
  const { question_id } = req.params;

  try {
    const [answers] = await dbConnection.query(
      `
      SELECT 
        a.answerid,
        a.questionid,
        a.answer,
        a.created_at,
        a.userid,
        u.username,
        u.avatar,
        u.bio,
        COALESCE(SUM(CASE WHEN ar.reaction = 'like' THEN 1 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN ar.reaction = 'dislike' THEN 1 END), 0) AS dislikes

      FROM answertable a
      JOIN usertable u 
        ON a.userid = u.userid
      LEFT JOIN answer_reactions ar 
        ON a.answerid = ar.answer_id

      WHERE a.questionid = ?
      GROUP BY
        a.answerid,
        a.questionid,
        a.answer,
        a.created_at,
        a.userid,
        u.username,
        u.avatar,
        u.bio

      ORDER BY a.created_at DESC
      `,
      [question_id]
    );
    
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
  const { answer } = req.body;
  const { question_id } = req.params;
  const userid = req.user.userid; // comes from auth middleware
  const username = req.user.username;
  console.log("POST ANSWER DEBUG:", { userid, question_id, answer });

  // Validate required fields
  if (!answer || !answer.trim()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide answer",
    });
  }

  try {
    await dbConnection.query(
      "INSERT INTO answertable (userid, questionid, answer) VALUES (?, ?, ?)",
      [userid, question_id, answer]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Answer created successfully.",
      answer: {
        userid,
        questionid: question_id,
        answer,
        username,
        created_at: new Date(),
      },
    });
  }catch (error) {
    console.log("POST ANSWER ERROR:", error.sqlMessage || error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

//============ Update Answer Controller ============//
const updateAnswer = async (req, res) => {
  const { answer_id } = req.params;
  const { answer } = req.body;
  const userid = req.user.userid;

  if (!answer || !answer.trim()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Answer cannot be empty",
    });
  }

  try {
    const [existing] = await dbConnection.query(
      "SELECT userid FROM answertable WHERE answerid = ?",
      [answer_id]
    );

    if (existing.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "Answer not found",
      });
    }

    if (existing[0].userid !== userid) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "Forbidden",
        message: "You are not allowed to edit this answer",
      });
    }

    await dbConnection.query(
      "UPDATE answertable SET answer = ? WHERE answerid = ?",
      [answer, answer_id]
    );

    return res.status(StatusCodes.OK).json({
      message: "Answer updated successfully",
    });
  } catch (error) {
    console.error(error.sqlMessage || error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
  
};

//============ Delete Answer Controller ============//
const deleteAnswer = async (req, res) => {
  const { answer_id } = req.params;
  const userid = req.user.userid;

  try {
    // Check if answer exists
    const [existing] = await dbConnection.query(
      "SELECT userid FROM answertable WHERE answerid = ?",
      [answer_id]
    );

    if (existing.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "Answer not found",
      });
    }

    // Check if logged-in user owns the answer
    if (existing[0].userid !== userid) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "Forbidden",
        message: "You are not allowed to delete this answer",
      });
    }

    // Delete the answer
    await dbConnection.query(
      "DELETE FROM answertable WHERE answerid = ?",
      [answer_id]
    );

    return res.status(StatusCodes.OK).json({
      message: "Answer deleted successfully",
    });

  } catch (error) {
    console.log(error.sqlMessage || error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

//============ LIKE Answer Controller ============//
async function likeAnswer(req, res) {
  try {
    const answerId = req.params.answer_id;
    const userId = req.user.userid;

    // check existing reaction
    const [rows] = await dbConnection.query(
      "SELECT * FROM answer_reactions WHERE answer_id=? AND user_id=?",
      [answerId, userId]
    );

    if (rows.length > 0) {
      // update reaction
      await dbConnection.query(
        "UPDATE answer_reactions SET reaction='like' WHERE answer_id=? AND user_id=?",
        [answerId, userId]
      );
    } else {
      // insert reaction
      await dbConnection.query(
        "INSERT INTO answer_reactions (answer_id, user_id, reaction) VALUES (?, ?, 'like')",
        [answerId, userId]
      );
    }

    // get updated counts
    const [[likes]] = await dbConnection.query(
      "SELECT COUNT(*) AS count FROM answer_reactions WHERE answer_id=? AND reaction='like'",
      [answerId]
    );

    const [[dislikes]] = await dbConnection.query(
      "SELECT COUNT(*) AS count FROM answer_reactions WHERE answer_id=? AND reaction='dislike'",
      [answerId]
    );

    res.json({ likes: likes.count, dislikes: dislikes.count });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
}



//============ DISLIKE Answer Controller ============//
async function dislikeAnswer(req, res) {
  try {
    const answerId = req.params.answer_id;
    const userId = req.user.userid;

    const [rows] = await dbConnection.query(
      "SELECT * FROM answer_reactions WHERE answer_id=? AND user_id=?",
      [answerId, userId]
    );

    if (rows.length > 0) {
      await dbConnection.query(
        "UPDATE answer_reactions SET reaction='dislike' WHERE answer_id=? AND user_id=?",
        [answerId, userId]
      );
    } else {
      await dbConnection.query(
        "INSERT INTO answer_reactions (answer_id, user_id, reaction) VALUES (?, ?, 'dislike')",
        [answerId, userId]
      );
    }

    const [[likes]] = await dbConnection.query(
      "SELECT COUNT(*) AS count FROM answer_reactions WHERE answer_id=? AND reaction='like'",
      [answerId]
    );

    const [[dislikes]] = await dbConnection.query(
      "SELECT COUNT(*) AS count FROM answer_reactions WHERE answer_id=? AND reaction='dislike'",
      [answerId]
    );

    res.json({ likes: likes.count, dislikes: dislikes.count });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
}




module.exports = {
  getAnswerByQId,
  postAnswer,
  updateAnswer,
  deleteAnswer,
  likeAnswer,
  dislikeAnswer,
};
