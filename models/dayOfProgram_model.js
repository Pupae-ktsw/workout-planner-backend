const mongoose = require('mongoose');
const Workout = require('./workout_model');

const dayOfProgramSchema = mongoose.Schema({
    program_id: {type: mongoose.Schema.Types.ObjectId, require: true},
    numberOfDay: {type: Number, require: true},
    totalDuration: {type: Number, require: true},
    dateCalendar: {type: Date, require: true},
    workouts:[{
        workoutStatus: {
            type: String,
            default: 'Undone',
            enum: ['Done', 'Undone']
        },
        youtubeVid: {
            url: {type: String, require: true},
            thumbnail: {type: String, require: true},
            title: {type: String, require: true},
            channel: {type: String, require: true},
            duration: {type: Number, require: true} // second
        }
    }]
    // workout_id: {
    //     type: [mongoose.Schema.Types.ObjectId],
    //     ref: 'Workout'
    // }
});

module.exports = mongoose.model('DayOfProgram', dayOfProgramSchema);