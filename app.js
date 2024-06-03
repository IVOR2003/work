const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const multer = require('multer');
const con = require("./connection");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

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

app.listen(5000, function(){
    console.log("Server is up and running");
});

app.get("/", function(req, res){
    res.render("form");
});

app.post("/", upload.single('profilePic'), function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var gender = req.body.gender;
    var profilePic = req.file ? req.file.filename : null;

    console.log(name, email, phone, gender, profilePic);

    var sql = 'INSERT INTO test (UserName, Email, Phone, Gender, ProfilePic) VALUES ?';
    var values = [[name, email, phone, gender, profilePic]];

    con.query(sql, [values], function(err, result) {
        if (err) throw err;
        console.log("Data Uploaded.");
        res.redirect('/submitted');
    });
});

app.get("/submitted", function(req, res){
    var sql = 'SELECT * FROM test';

    con.query(sql, function(error, results){
        if (error) throw error;
        res.render("display", { test: results });
    });
});

app.get("/update", function(req, res){
    var id = req.query.id;
    var sql = "SELECT * FROM test WHERE id = ?";

    con.query(sql, [id], function(error, result){
        if (error) throw error;
        res.render('update', { test: result });
    });
});

app.post("/updateData", upload.single('profilePic'), function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var gender = req.body.gender;
    var id = req.body.id;
    var profilePic = req.file ? req.file.filename : req.body.existingProfilePic;

    console.log(name, email, phone, gender, profilePic, id);

    var sql = "UPDATE test SET UserName = ?, Email = ?, Phone = ?, Gender = ?, ProfilePic = ? WHERE id = ?";
    con.query(sql, [name, email, phone, gender, profilePic, id], function(error, result){
        if (error) throw error;
        console.log("Data updated.");
        res.redirect("/submitted");
    });
});

app.get("/delete", function(req, res){
    var id = req.query.id;
    var sql = "DELETE FROM test WHERE id = ?";

    con.query(sql, [id], function(error, result){
        if (error) throw error;
        res.redirect("/submitted");
    });
});
