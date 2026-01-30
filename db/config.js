require('dotenv').config();

const mysql2 = require("mysql2");
const fs = require("fs");
const path = require("path");

// Create pool
const pool = mysql2.createPool({
    user: process.env.USER,
    host: process.env.DB_HOST,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        ca: fs.readFileSync(path.resolve(__dirname, "..", process.env.CA))
    },
});

// Convert to promise pool
const db = pool.promise();

// Test connection
db.getConnection()
    .then(conn => {
        console.log("TiDB connected successfully");
        conn.release();
    })
    .catch(err => {
        console.error(" TiDB connection error:", err.message);
    });

module.exports = db;
