const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const multer = require('multer');
const pool = require('./connection');
const bodyParser = require('body-parser');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.listen(5000, function() {
    console.log('Server is up and running');
});

app.get('/', function(req, res) {
    res.render('form');
});

app.post('/', upload.single('profilePic'), function(req, res) {
    const { name, email, phone, gender } = req.body;
    const profilePic = req.file ? req.file.filename : null;

    const sql = 'INSERT INTO test (UserName, Email, Phone, Gender, ProfilePic) VALUES ?';
    const values = [[name, email, phone, gender, profilePic]];

    pool.query(sql, [values], function(err, result) {
        if (err) throw err;
        console.log('Data Uploaded.');
        res.redirect('/submitted');
    });
});

app.get('/submitted', function(req, res) {
    const sql = 'SELECT * FROM test';

    pool.query(sql, function(error, results) {
        if (error) throw error;
        res.render('display', { test: results });
    });
});

app.get('/update', function(req, res) {
    const { id } = req.query;
    const sql = 'SELECT * FROM test WHERE id = ?';

    pool.query(sql, [id], function(error, result) {
        if (error) throw error;
        res.render('update', { test: result });
    });
});

app.post('/updateData', upload.single('profilePic'), function(req, res) {
    const { name, email, phone, gender, id, existingProfilePic } = req.body;
    const profilePic = req.file ? req.file.filename : existingProfilePic;

    const sql = 'UPDATE test SET UserName = ?, Email = ?, Phone = ?, Gender = ?, ProfilePic = ? WHERE id = ?';
    pool.query(sql, [name, email, phone, gender, profilePic, id], function(error, result) {
        if (error) throw error;
        console.log('Data updated.');
        res.redirect('/submitted');
    });
});

app.get('/delete', function(req, res) {
    const { id } = req.query;
    const sql = 'DELETE FROM test WHERE id = ?';

    pool.query(sql, [id], function(error, result) {
        if (error) throw error;
        res.redirect('/submitted');
    });
});
