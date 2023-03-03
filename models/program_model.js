const mongoose = require('mongoose');
const DayOfProgram = require('./dayOfProgram_model');
const User = require('./user_model');

const programSchema = mongoose.Schema({
    programName: {
        type: String,
        required: true,
        maxlength: 40
    },
    playlistURL: {
        type: String,
        required: true,
    },
    programStatus: {
        type: String,
        default: 'Challenging',
        enum: ['Challenging', 'Completed', 'Non-Start']
    },
    startEndDate: {
        type: Map,
        of: Date
    },
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
        type: String
    },
    remindAf: {
        type: String
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
    day_id: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'DayOfProgram',
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

});

module.exports = mongoose.model('Program', programSchema);