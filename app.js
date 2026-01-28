require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5500;
const cors = require('cors')

// Middleware to parse
app.use(express.json());
app.use(cors());

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
        const results = await dbConnection.execute("select 'Connected to MySQL2 database' ");
        console.log(results);
        
        // Listen on the port
        await app.listen(port, ()=>{
            console.log(`Server is running on port ${port}`);
        })
        
    }catch(error){
        console.log("Database connection failed:", error.message);
    }
}

app.listen(port, () => console.log(`Backend running on ${port}`));

start();


