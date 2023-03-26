const mongoose = require('mongoose');
const DayOfProgram = require('./dayOfProgram_model');
const User = require('./user_model');

const programSchema = mongoose.Schema({
    // _id: String,
    programName: {
        type: String,
        required: true,
        maxlength: 40
    },
    // playlistURL: {
    //     type: String,
    // },
    programStatus: {
        type: String,
        default: 'Challenging',
        enum: ['Challenging', 'Completed']
    },
    startEndDate: 
        [{startDate: Date, endDate: Date}],
    color: {
        type: String,
        required: true
    },
    workoutTime: {
        type: String,
        required: true
    },
    isReminder: {
        type: Boolean,
        default: false
    },
    remindBf: {
        type: Number,
        default: 0,
        enum: [0, 10, 30, 60]
    },
    remindAf: {
        type: Number,
        default: 30,
        enum: [30, 45, 60, 90, 120, 180]
    },
    repeatType: {
        type: String,
        default: 'Daily',
        enum: ['Daily', 'Weekly']
    },
    repeatDaily: Number,
    repeatWeekly: [Number],
    totalDays: Number,
    thumbnail: String,
    // day_id: {
    //     type: [mongoose.Schema.Types.ObjectId],
    //     ref: 'DayOfProgram',
    // },
    // dates: [Date],
    latestDay: Number,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

});

module.exports = mongoose.model('Program', programSchema);