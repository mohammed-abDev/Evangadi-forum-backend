require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4000;

// ================================
// CORS
// ================================

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://evangadi-forum-mohammmed-abdu.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

// ================================
// DATABASE
// ================================

const dbConnection = require("./db/config");

// ================================
// ROUTES
// ================================

const userRoutes = require("./Routes/UserRouts");
const questionRoutes = require("./Routes/questionsRouts");
const answerRoutes = require("./Routes/answersRouts");
const chatRoutes = require("./Routes/chatRoutes.js");

app.use("/api/user", userRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/question/", answerRoutes);
app.use("/api/chat", chatRoutes);

// ================================
// UPLOADS
// ================================

app.use("/uploads", express.static("uploads"));

// ================================
// START SERVER
// ================================

const start = async () => {
  try {
    const results = await dbConnection.execute("select 'TiDB connected'");
    console.log(results);

    app.listen(port, () => {
      console.log(`Backend is running on port ${port}`);
    });
  } catch (error) {
    console.log("Database connection failed:", error.message);
  }
};

start();
