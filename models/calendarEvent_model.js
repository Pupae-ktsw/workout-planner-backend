const mongoose = require('mongoose');

const calendarEventSchema = mongoose.Schema({
    eventDate: { type: Date, required: true},
    // numberOfWorkout: { type: Number, required: true},
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dayProgram: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DayOfProgram',
        required: true
    }]
});

module.exports = mongoose.model('CalendarEvents', calendarEventSchema);