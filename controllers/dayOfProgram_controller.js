// for handling error without using try/catch
const asyncHandler = require('express-async-handler');

const DayOfProgram = require('../models/dayOfProgram_model');
const YoutubeVideo = require('../models/youtubeVideo_model');
const CalendarEvent = require('../models/calendarEvent_model');

// @desc    Get All DayOfProgram of each Program
// @route   GET /programs/:programId/days
// @access  Private
const getDaysOfProgram = asyncHandler(async (req, res) => {
    const dayOfProgram = await DayOfProgram.find({
        program_id: req.params.programId}).populate('youtubeVid').populate('program_id');
    res.status(200).json(dayOfProgram);
});

// @desc    Get Specific DayOfPrograms
// @route   GET /programs/:programId/days/:id
// @access  Private
const getThisDayOfProgram = asyncHandler(async (req, res) => {
    const thisDayOfProgram = await DayOfProgram.findById(req.params.id);
    res.status(200).json(thisDayOfProgram);
});

// @desc    Get Specific DayOfPrograms By DATE
// @route   GET /days/:date
// @access  Private
const getDaysOfProgramByDate = asyncHandler(async (req, res) => {
    const thisDayOfProgram = await DayOfProgram.find(
        {dateCalendar: req.params.date, user_id: req.user._id});
    if(thisDayOfProgram){
        res.status(200).json(thisDayOfProgram);  
    }else {
        res.status(404);
        throw new Error('No workouts Found');
    }
    
});


// @desc    Create DayOfProgram
// @route   POST /DayOfPrograms
// @access  Private
const createDayOfProgram = asyncHandler(async (req, res) => {
    console.log(req.body);

    // TO DO: validation fields and warning to dayOfProgram req.body.<fieldNameJSON>
    if(!req.body) {
        res.status(400);
        throw new Error('Wrong Request body');
    }

    const dayOfProgram = await DayOfProgram.create({
        numberOfDay: req.body.numberOfDay,
        totalDuration: req.body.totalDuration,
        dateCalendar: req.body.dateCalendar,
        workout_id: req.body.workout_id
    });
    res.status(200).json(dayOfProgram);
});

// @desc    Update DayOfPrograms
// @route   PUT /DayOfPrograms/:id
// @access  Private
const updateDayOfProgram = asyncHandler(async (req, res) => {
    const dayOfProgram = await DayOfProgram.findById(req.params.id);
    if(!dayOfProgram) {
        res.status(400);
        throw new Error('DayOfProgram not found');
    }
    const updatedDayOfProgram = await DayOfProgram.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    })
    res.status(200).json(updatedDayOfProgram);
});

// @desc    Delete DayOfPrograms
// @route   DELETE /DayOfPrograms/:id
// @access  Private
const deleteDayOfProgram = asyncHandler(async (req, res) => {
    const dayOfProgram = await DayOfProgram.findById(req.params.id);
    if(!dayOfProgram) {
        res.status(400);
        throw new Error('DayOfProgram not found');
    }
    const deletedDayOfProgram = await DayOfProgram.findByIdAndRemove(req.params.id, req.body);
    res.status(200).json({ message: `Delete dayOfProgram ${deletedDayOfProgram.name}`});
});


const createBulkDayOfProgram = async (daysProgram, dates, programId, userId) => {
    var newDayOfPrograms = [];
    var newYoutubeVids = []; 
    var newCalendarEvents = [];
    const youtubeDB = new Map((await YoutubeVideo.find())
                    .map(obj => {
                        return [obj.url, obj];
                    }));
    // console.log(`youtubeDB: ${youtubeDB}`);

    try{
        for(var index=0; index<daysProgram.length; index++){
            let item = daysProgram[index];        
            let ytVid = youtubeDB.get(item.youtubeVid.url);
            if(!ytVid){
                ytVid = YoutubeVideo({
                    url: item.youtubeVid.url,
                    thumbnail: item.youtubeVid.thumbnail,
                    title: item.youtubeVid.title,
                    channel: item.youtubeVid.channel,
                    duration: item.youtubeVid.duration
                });
                youtubeDB.set(ytVid.url, ytVid);
                newYoutubeVids.push(ytVid);
            }
            // create DayOfProgram
            let dayPg = DayOfProgram({
                program_id: programId,
                numberOfDay: item.numberOfDay,
                dateCalendar: dates[index],
                youtubeVid: ytVid._id
            });
            newDayOfPrograms.push(dayPg);

            // create CalendarEvent
            let calendarEvent = await CalendarEvent.find(
                {eventDate: dates[index] , user_id: userId}).limit(1);

            if (calendarEvent[0]) {
                calendarEvent[0].dayProgram.push(dayPg._id);
                calendarEvent[0].save();
            }else {
                
                let event = CalendarEvent({
                    eventDate: dates[index],
                    user_id: userId,
                    dayProgram: [dayPg._id]
                });
                newCalendarEvents.push(event);
            }
        }

        YoutubeVideo.insertMany(newYoutubeVids);
        DayOfProgram.insertMany(newDayOfPrograms, {ordered: true});
        CalendarEvent.insertMany(newCalendarEvents, {ordered: true});
    }catch(err){
        console.log(err);
    }


}

module.exports = {
    createBulkDayOfProgram, getDaysOfProgram, getThisDayOfProgram, getDaysOfProgramByDate, createDayOfProgram, updateDayOfProgram, deleteDayOfProgram
}