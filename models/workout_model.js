const mongoose = require('mongoose');
const YoutubeVideo = require('./youtubeVideo_model');
const DayOfProgram = require('./dayOfProgram_model');

const workoutSchema = mongoose.Schema({
    workoutStatus: {
        type: String,
        default: 'Undone',
        enum: ['Done', 'Undone']
    },
    // youtubeVid_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'YoutubeVideo',
    //     required: true
    // },
    // dayOfProgram_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'DayOfProgram',
    //     required: true,
    // }
});

module.exports = mongoose.model('Workout', workoutSchema);