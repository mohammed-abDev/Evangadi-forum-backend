require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

// Middleware to parse
app.use(express.json());
app.use(cors());

const allowedOrigins = [
  "http://localhost:5173",
  "https://evangadi-forum-mohammmed-abdu.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

//database connection
const dbConnection = require('./db/config');

// Import routes
const userRoutes = require('./Routes/UserRouts');
const questionRoutes = require('./Routes/questionsRouts');
const answerRoutes = require('./Routes/answersRouts');
const chatRoutes = require('./Routes/chatRoutes.js');


// Use routes  Middleware with prefixes
app.use('/api/user', userRoutes);
app.use('/api/question', questionRoutes);
app.use("/api/question/", answerRoutes);
app.use("/api/chat", chatRoutes);

//avator 
const path = require("path");
app.use("/uploads", express.static("uploads"));

// Start the server
const start = async () => {
    try {
        // Test database connection
        const results = await dbConnection.execute("select 'TiDB connected' ");
        console.log(results);
        
        // Listen on the port
        app.listen(port, ()=>{
            console.log(`Backend  is running on port ${port}`);
        })
        
    }catch(error){
        console.log("Database connection failed:", error.message);
    }
}


start();


