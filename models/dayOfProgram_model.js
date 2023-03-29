const mongoose = require('mongoose');

const dayOfProgramSchema = mongoose.Schema({
    program_id: {type: mongoose.Schema.Types.ObjectId, require: true},
    numberOfDay: {type: Number, require: true},
    dateCalendar: {type: Date, require: true},
    workoutStatus: {
        type: String,
        default: 'Undone',
        enum: ['Done', 'Undone'],
    },
    youtubeVid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'YoutubeVideo',
        required: true
    }
});

module.exports = mongoose.model('DayOfProgram', dayOfProgramSchema);