const mongoose = require('mongoose');
// const YoutubeVideo = require('./youtubeVideo_model');
// const DayOfProgram = require('./dayOfProgram_model');
const User = require('./user_model');
const DayOfProgram = require('./dayOfProgram_model');

const calendarEventSchema = mongoose.Schema({
    eventDate: { type: Date, required: true},
    numberOfWorkout: { type: Number, required: true},
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workouts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DayOfProgram',
        required: true
        // programName: {type: String, required: true},
        // numberOfDay: {type: Number, required: true},
        // totalDays: {type: Number, required: true},
        // workoutStatus: {
        //     type: String,
        //     default: 'Undone',
        //     enum: ['Done', 'Undone']
        // },
        // youtubeVid: {
        //     url: {type: String, require: true},
        //     thumbnail: {type: String, require: true},
        //     title: {type: String, require: true},
        //     channel: {type: String, require: true},
        //     duration: {type: Number, require: true} // second
        // }
    }]

});

module.exports = mongoose.model('CalendarEvents', calendarEventSchema);