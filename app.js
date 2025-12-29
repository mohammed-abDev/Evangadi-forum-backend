require('dotenv').config();
const express = require('express');
const app = express();
const port = 5500;

// Middleware to parse incoming requests
app.use(express.json());
// Import database connection
const dbConnection = require('./db/config');

// Import routes
const userRoutes = require('./Routes/UserRouts');
const questionRoutes = require('./Routes/questionsRouts');
const answerRoutes = require('./Routes/answersRouts');

// json Middleware to parse incoming requests
app.use(express.json());

// Use routes  Middleware with prefixes
app.use('/api/user', userRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/answer', answerRoutes);

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
start();


