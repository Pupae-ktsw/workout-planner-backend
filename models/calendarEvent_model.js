const mongoose = require('mongoose');
const YoutubeVideo = require('./youtubeVideo_model');
const DayOfProgram = require('./dayOfProgram_model');
const User = require('/user_model');

const workoutSchema = mongoose.Schema({
    eventDate: Date,
    numberOfWorkout: Number,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    videoRoutine: {
        type: Map,
        of: String, 
    }

});

module.exports = mongoose.model('Workout', workoutSchema);