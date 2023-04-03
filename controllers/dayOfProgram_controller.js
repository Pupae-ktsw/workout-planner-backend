// for handling error without using try/catch
const asyncHandler = require('express-async-handler');

const Program = require('../models/program_model');
const services = require('../services/services');
const programController = require('./program_controller');
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

// @desc    PUT DayOfPrograms
// @route   PUT /dayOfPrograms/:id
// @access  Private
const updateWorkoutStatus = asyncHandler(async (req, res) => {
    const thisDayOfProgram = await DayOfProgram.findById(req.params.id);
    if(!thisDayOfProgram) {
        res.status(404);
        throw new Error('DayOfProgram not found');
    }

    const program = await Program.findById(thisDayOfProgram.program_id);
    if(!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    if(req.body.workoutStatus === 'Done'){
        thisDayOfProgram.workoutStatus = 'Done';
        await thisDayOfProgram.save();
        // Program.findByIdAndUpdate(dayOfProgram.program_id, {latestDay: dayOfProgram.numberOfDay+1});
        if(thisDayOfProgram.numberOfDay === program.totalDays && thisDayOfProgram.workoutStatus === 'Done'){
            program.programStatus = 'Completed';
            await program.save();
            res.status(200).json({message: `Congratulation! you just finished ${program.programName}`});
        }else {
            program.latestDay = thisDayOfProgram.numberOfDay+1;
            await program.save();
            res.status(200).json({message: `Finished ${program.programName} Day ${thisDayOfProgram.numberOfDay}`});
        }

    }else if(req.body.workoutStatus === 'Skip'){
        console.log('-----------------SKIP WORKOUT-----------------');
        const startNewDate = thisDayOfProgram.dateCalendar.addDays(1);
        const dayPrograms = await DayOfProgram.find({program_id: program._id, numberOfDay: {$gte: program.latestDay}});
        dayPrograms.sort((a,b) => a.dateCalendar - b.dateCalendar);
        const mapEventDB = new Map((await CalendarEvent.find({user_id: req.user._id}))
                                .map(obj => {
                                    return [obj.eventDate.getTime(), obj];
                                }));
        // console.log(`days program length: ${dayPrograms.length}`);
        // console.log(`mapEventDB: ${[...mapEventDB.entries()]}`);
        const frequently = program.repeatType === 'Weekly' ? program.repeatWeekly: program.repeatDaily;
        const newDates = services.generateDates(startNewDate, frequently, dayPrograms.length);
        // console.log(`newDates: ${newDates}`);
        // console.log(`dayPrograms::BF: ${dayPrograms}`);

        const updateDayProgram = [];
        const updateCalendarEvent = [];

        dayPrograms.forEach((item, index, arr) => {
            let itemDate = item.dateCalendar.getTime();
            // console.log(`dateCalendar: ${itemDate}`);
            // console.log(`loop daypg: ${mapEventDB.get(itemDate)}`);
            
            // remove skipped dayOfProgram from today date in CalendarEvent
            let dayProgramEvent = mapEventDB.get(itemDate).dayProgram;
            let removedIndex = dayProgramEvent.indexOf(item._id);
            if(removedIndex > -1){
                // dayProgramEvent.splice(removedIndex, 1);
                // mapEventDB.get(itemDate).dayProgram = dayProgramEvent;
                mapEventDB.get(itemDate).dayProgram.splice(removedIndex, 1);
            }


            let itemNewDate = newDates[index].getTime();

            // if new date is not in calendarEvent before, then create new CalendarEvent object

            let isUpsert = false;
            if(mapEventDB.get(itemNewDate) !== undefined){
                mapEventDB.get(itemNewDate).dayProgram.push(item._id);
            }else {
                isUpsert = true;
                let newEvent = CalendarEvent({
                    eventDate: newDates[index],
                    user_id: req.user._id,
                    dayProgram: [item._id]
                })
                mapEventDB.set(itemNewDate, newEvent);
            }

            updateDayProgram.push({
                updateOne: {
                    filter: {_id: item._id},
                    update: { $set: {dateCalendar: newDates[index]}}
                }
            });
        });
        const listEvent = Array.from(mapEventDB.values());
        listEvent.forEach((event) => {
            updateCalendarEvent.push({
                updateOne: {
                    filter: { eventDate: event.eventDate },
                    update: { $set: {dayProgram: event.dayProgram, user_id: req.user._id}},
                    upsert: true
                }
            });
        });
        // console.log(`dayPrograms::AF: ${dayPrograms}`);
        // console.log(`mapEventDB:: AF: ${[...mapEventDB.entries()]}`);
        // console.log('///////////////////////////////////////////');
        // console.log(`updateDayPg: ${[...updateDayProgram.entries()]}`);
        // console.log(`updateEvent: ${[...updateCalendarEvent.entries()]}`);

        try {
	        const resUpdateDayPg = await DayOfProgram.bulkWrite(updateDayProgram);
	        console.log(`dayPg upsertedCount: ${resUpdateDayPg.upsertedCount}`);
	        console.log(`dayPg modifiedCount: ${resUpdateDayPg.modifiedCount}`);
	        const resUpdateEvent = await CalendarEvent.bulkWrite(updateCalendarEvent);
            console.log(`event upsertedCount: ${resUpdateEvent.upsertedCount}`);
	        console.log(`event modifiedCount: ${resUpdateEvent.modifiedCount}`);
            res.status(200).json({message: 'skip workout successfully'});
        } catch (error) {
            res.status(400);
            throw new Error(error);
        }
    }
});

module.exports = {
    createBulkDayOfProgram, updateWorkoutStatus, getDaysOfProgram, getThisDayOfProgram, getDaysOfProgramByDate, createDayOfProgram, updateDayOfProgram, deleteDayOfProgram
}