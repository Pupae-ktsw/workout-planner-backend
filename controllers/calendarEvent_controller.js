const asyncHandler = require('express-async-handler');

const CalendarEvent = require('../models/calendarEvent_model');

// @desc    Get all events of each user
// @route   GET /calendarEvents
// @access  Private
const getCalendarEvents = asyncHandler(async (req, res) => {
    const calendarEvents = await CalendarEvent.find({user_id: req.user._id})
                            .populate({
                                path: 'dayProgram',
                                populate: [{
                                    path: 'program_id',
                                    model: 'Program'
                                }, 
                                {
                                    path: 'youtubeVid',
                                    model: 'YoutubeVideo'
                                }]
                            })
                            // .populate('dayProgram');
    if (calendarEvents){
        res.status(200).json(calendarEvents);  
    }else {
        res.status(404);
        throw new Error ('No Events Found');
    }
    
});

// // @desc    Get all events by specific date of each user
// // @route   GET /calendarEvents/date
// // @access  Private
// const getCalendarEventsByDate = asyncHandler(async (req, res) => {
//     const calendarEventsDate = await DayOfProgram.find({user_id: req.user._id, eventDate: req.params.date});
//     res.status(200).json(calendarEventsDate);
// });

module.exports = {
    getCalendarEvents
}