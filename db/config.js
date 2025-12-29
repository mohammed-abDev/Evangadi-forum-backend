const mysql2 = require("mysql2");

// Create a connection pool to the MySQL database
const dbConection = mysql2.createPool({
    database: process.env.DATABASE ,
    host: "localhost",
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectionLimit: 10
});
module.exports = dbConection.promise();