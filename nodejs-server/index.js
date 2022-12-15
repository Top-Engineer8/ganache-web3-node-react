const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const app = express();
const bodyParser = require('body-parser');
var constants = require('./config/db');

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

// connect to the Database
var connect = mysql.createConnection({
    user: constants.MYSQL_USERNAME,
    password: constants.MYSQL_PASSWORD,
    host: 'localhost',
    database: 'city_db'
});

connect.connect((err, result) => {
    if(err) {
        console.log('Error on connect database: ' + err);
    } else {
        console.log('Connect to the database successfully');
    }
});

dotenv.config({path: './config/config.env'});
var port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Home page');
    console.log('Home page');
});

app.listen(port, () => {
    console.log("Listining on port " + port);
});

app.post('/api/city/', (req, res) => { // insert
    const name = req.body.name;

    const sql = "insert into city (name) values (?)";
    connect.query(sql, 
        [name], 
        (err, result, fields) => {
        if (err) throw err;
        const sql2 = "insert into _logs_city (city_id, name, action)"
            +" values (?, ?, ?)";
        connect.query(sql2, [result.insertId, name, 'insert'], (err2, result2) => {
            if (err2) throw err2;
            res.send(result);
        });
    });
});

app.get('/api/cities', (req, res) => { // get list
    connect.query("select * from city where is_deleted<>1", (err, result, fields) => {
        if (err) throw err;
        res.send(result);
    });
});

app.put('/api/city', (req, res) => { // update or delete
    const queryType = req.body.query_type;
    const id = req.body.city_id;

    if (queryType == "update") {
        const name = req.body.name;

        const sql = "update city set name='" + name + "' where id=" + id;
        connect.query(sql, (err, result) => {
            if (err) throw err;

            const sql2 = "insert into _logs_city (city_id, name, action)"
                +" values (?,?,?)";
            connect.query(sql2, [id, name, 'update'], (err2, result2) => {
                if (err2) throw err2;
                res.send(result);
            });
        });
    } else { // delete
        const sql = "update city set is_deleted=1 where id=" + id;
                connect.query(sql, (err, result) => {
                    if (err) throw err;
            
                    const sql2 = "insert into _logs_city (city_id, action)"
                        +" values (?,?)";
                    connect.query(sql2, [id, 'delete'], (err2, result2) => {
                        if (err2) throw err2;
                        res.send(result);
                    });
                });
            
        }
    });
