// for handling error without using try/catch
const asyncHandler = require('express-async-handler');
const CalendarEvent = require('../models/calendarEvent_model');
const DayOfProgram = require('../models/dayOfProgram_model');
const YoutubeVideo = require('../models/youtubeVideo_model');
const User = require('../models/user_model');

const Program = require('../models/program_model');
const { generateDates } = require('../services/services');
const DayOfProgramController = require('./dayOfProgram_controller');

// @desc    Get All suggest programs in main Page
// @route   GET /programs/suggest
// @access  Private
const getSuggestProgram = asyncHandler(async (req, res) => {
    const admin = await User.find({email: 'admin@gmail.com'});
    const programs = await Program.find({user_id: admin._id});
    res.status(200).json(programs);
});

const getThisSuggestProgram = asyncHandler(async (req, res) => {
    const admin = await User.find({email: 'admin@gmail.com'});
    const programs = await Program.find({user_id: admin._id});
    res.status(200).json(programs);
});

// @desc    Get All programs of each user
// @route   GET /programs
// @access  Private
const getPrograms = asyncHandler(async (req, res) => {
    const programs = await Program.find({user_id: req.user._id});
    res.status(200).json(programs);
});

// @desc    Get Specific Programs of each user
// @route   GET /programs/:id
// @access  Private
const getThisProgram = asyncHandler(async (req, res) => {
    const thisProgram = await Program.findById(req.params.id);
    res.status(200).json(thisProgram);
});

// @desc    Create Program
// @route   POST /programs
// @access  Private
const createProgram = asyncHandler(async (req, res) => {
    const {programName, color, workoutTime,
        isReminder, repeatType} = req.body;
    const daysProgram = req.body.dayOfProgram;
    // const totalDays = req.body.totalDays;
    const totalDays = daysProgram.length;
    var startDate = null;

    
    if (req.body.startEndDate){
        startDate = new Date(req.body.startEndDate[0].startDate); 
        console.log(`startDate body: ${req.body.startEndDate[0]}`);
    }else {
        startDate = new Date(Date.now());
    }
    
    startDate.setUTCHours(0,0,0,0);
   
    // Use in Notification
    // startDate.setHours(workoutTime.split(':')[0]);
    // startDate.setMinutes(workoutTime.split(':')[1]);
    // startDate.setSeconds(0);
    // startDate.setMilliseconds(0);

    console.log(`startDate: ${startDate}`);
    if(!req.body) {
        res.status(400);
        throw new Error('No Request body');
    }
    if(!daysProgram){
        res.status(400);
        throw new Error('Miss day of program');
    }
    if(repeatType === 'Weekly' && req.body.repeatWeekly.length > totalDays ) {
        throw new Error(`Choose only ${totalDays} day of week`);
    }


    const frequently = repeatType === 'Weekly' ? req.body.repeatWeekly: req.body.repeatDaily;
    var dates = generateDates(startDate, frequently, totalDays);
    // if(repeatType === 'Daily'){

    // }
    if(dates.length != totalDays) {
        console.log(`dates3: ${dates}`);
        res.status(500);
        throw new Error('Wrong Calculated dates');
    }
    console.log(`dates gen: ${dates}`);
    // create Program    
    const program = await Program.create({
        programName: programName,
        programStatus: 'Challenging',
        startEndDate: [{startDate: startDate, endDate: startDate}],
        color: color,
        workoutTime: workoutTime,
        isReminder: isReminder,
        remindBf: isReminder? req.body.remindBf:null,
        remindAf: isReminder? req.body.remindAf:null,
        repeatType: repeatType,
        repeatDaily: repeatType == 'Daily'? req.body.repeatDaily: null,
        repeatWeekly: repeatType == 'Weekly'? req.body.repeatWeekly: null,
        totalDays: totalDays,
        thumbnail: daysProgram[0].youtubeVid.thumbnail,
        latestDay: 1,
        // day_id: body.day_id,0
        user_id: req.user._id
    });
    
    // create related model:
    // DayOfProgram, YoutubeVideo, CalendarEvent
    DayOfProgramController.createBulkDayOfProgram(daysProgram, dates, program._id, req.user._id);
    res.status(200).json(program);
});

// @desc    Create Program by admin
// @route   POST /programs/admin 
// @access  Private
const createProgramAdmin = async(req,res) => {
    const daysProgram = req.body.dayOfProgram;
    const program = await Program({
        programName: req.body.programName,
        thumbnail: daysProgram[0].youtubeVid.thumbnail
    });
    await program.save({validateBeforeSave: false});

    var newDayOfPrograms = [];
    var newYoutubeVids = []; 
    const youtubeDB = new Map((await YoutubeVideo.find())
                    .map(obj => {
                        return [obj.url, obj];
                    }));

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
                });
                youtubeDB.set(ytVid.url, ytVid);
                newYoutubeVids.push(ytVid);
            }
            // create DayOfProgram
            let dayPg = DayOfProgram({
                program_id: program._id,
                numberOfDay: item.numberOfDay,
                youtubeVid: ytVid._id,
                user_id: req.user._id
            });
            newDayOfPrograms.push(dayPg);

        }
        await YoutubeVideo.insertMany(newYoutubeVids, {ordered: true});
        await DayOfProgram.insertMany(newDayOfPrograms, {validateBeforeSave: false});

        res.status(200).json(program);
    }catch(err){
        console.log(err);
    }
}

// @desc    Update Programs
// @route   PUT /programs/:id
// @access  Private
const updateProgram = asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id);
    if(!program) {
        res.status(400);
        throw new Error('Program not found');
    }
    const updatedProgram = await Program.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    })
    res.status(200).json(updatedProgram);
});

// @desc    Delete Programs and
// @route   DELETE /programs/:id
// @access  Private
const deleteAllDataByUser = asyncHandler(async (req, res) => {
    const programs = await Program.find({user_id: req.user._id});
    const programIds = programs.distinct('_id');
    const dayOfPrograms = await DayOfProgram.find({program_id: {$in: programIds}});
    const calendarEvents = await CalendarEvent.find({user_id: req.user._id});
});

// @desc    Delete Programs and
// @route   DELETE /programs/:id
// @access  Private
const deleteProgram = asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id);
    if(!program) {
        res.status(400);
        throw new Error('Program not found');
    }
    const dayPrograms = await DayOfProgram.find({program_id: program._id});
    const mapEventDB = new Map((await CalendarEvent.find({user_id: req.user._id}))
    .map(obj => {
        return [obj.eventDate.getTime(), obj];
    }));
    const updateCalendarEvent = [];
    for ( var dayPg of dayPrograms) {
        let event = mapEventDB.get(dayPg.dateCalendar.getTime());
        let dayProgramEvent = event? event.dayProgram: undefined;
        console.log(`date: ${dayPg.dateCalendar}, dayProgramEvent: ${dayProgramEvent}`);
        let removedIndex = dayProgramEvent? dayProgramEvent.indexOf(dayPg._id): -1;
        console.log(`removed Index: ${removedIndex}`);

        if(removedIndex > -1){
            dayProgramEvent.splice(removedIndex,1);
            // mapEventDB.get(itemDate).dayProgram.splice(removedIndex, 1);
        }
        console.log(`dayProgramEvent Delete: ${dayProgramEvent}`);
        if(dayProgramEvent !== undefined && dayProgramEvent !== null){
            console.log(`push stack: date ${dayPg.dateCalendar}`);
            updateCalendarEvent.push({
                updateOne: {
                    filter: {eventDate: dayPg.dateCalendar, user_id: req.user._id},
                    update: {$set: {dayProgram: dayProgramEvent}}
                }
            });
        }

    }
    console.log(`updateCalendar Event length: ${updateCalendarEvent.length}`);
    if(updateCalendarEvent.length > 0){
        const resUpdateEvent = await CalendarEvent.bulkWrite(updateCalendarEvent);
        console.log(`event modifiedCount: ${resUpdateEvent.modifiedCount}`);

        if( resUpdateEvent.modifiedCount !== dayPrograms.length) {
        res.status(400);
        throw new Error ('Cannnot Delete DayProgram in CalendarEvent');
        }
    }
    

    const resDeleteDayProgram = await DayOfProgram.deleteMany({program_id: program._id});
    console.log(`res Delete: ${resDeleteDayProgram.ok}`);
    console.log(`res Delete: ${resDeleteDayProgram.deletedCount}`);
    
    if(resDeleteDayProgram.deletedCount !== dayPrograms.length){
        res.status(400);
        throw new Error ('Cannnot Delete DayOfProgram');
    }
    program.remove();

    res.status(200).json(`Delete Program: ${program.programName}`);

});


module.exports = {
    createProgramAdmin, getSuggestProgram, getPrograms, getThisProgram, createProgram, updateProgram, deleteProgram
}