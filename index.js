const express = require('express');
const dotenv = require('dotenv').config();
const {errorHandler} = require('./middleware/error_middleware');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = process.env.PORT;

connectDB();

const app = express();


app.use(express.json());
//app.use(bodyParser.json());
app.use(express.urlencoded({extended : false}))
app.get('/', (req, res) => {
    res.status(200).json({message: 'On Home Page'}); 
});

app.use('/users', require('./routes/users_route'));
app.use(errorHandler);
app.listen(port, () => {
    console.log(`Server Started at ${port}`);
});