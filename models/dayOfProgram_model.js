const mongoose = require('mongoose');
const Workout = require('./workout_model');

const dayOfProgramSchema = mongoose.Schema({
    numberOfDay: Number,
    totalDuration: Number,
    dateCalendar: Date,
    workout_id: {
        type: [mongoose.ObjectId],
        ref: 'Workout'
    }
});

module.exports = mongoose.model('DayOfProgram', dayOfProgramSchema);