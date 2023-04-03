require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {errorHandler} = require('./middleware/error_middleware');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const port = process.env.PORT;

connectDB();

const app = express();

// app.use(cors);
app.use(express.json());
app.use(bodyParser.json());

// for testing in postman, no need to type all input as json format
app.use(express.urlencoded({extended : false}));

app.get('/', (req, res) => {
    res.status(200).json({message: 'On Home Page'}); 
});

//Youtube
app.use('/search', require('./routes/youtube_route'));

app.use('/users', require('./routes/users_route'));
app.use('/programs', require('./routes/programs_route'));
app.use('/calendarEvents', require('./routes/calendarEvents_route'));
app.use('/dayOfPrograms', require('./routes/dayOfProgram_route'));
app.use('/notification', require('./routes/notification_route'));
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server Started at ${port}`);
});