const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT
});

pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Database connected successfully.");
    connection.release(); // release the connection back to the pool
});

module.exports = pool;
