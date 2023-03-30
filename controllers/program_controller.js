// for handling error without using try/catch
const asyncHandler = require('express-async-handler');

const Program = require('../models/program_model');
const DayOfProgramController = require('./dayOfProgram_controller');

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
    if(req.body.repeatWeekly.length > totalDays ) {
        throw new Error(`Choose only ${totalDays} day of week`);
    }

    var dates = [];
    if(repeatType == 'Daily'){
        let startDay = startDate;
        for(let i=0; i<totalDays; i++){
            dates.push(startDay);
            startDay = startDay.addDays(req.body.repeatDaily);
        }

    }else if (repeatType == 'Weekly'){
        let repeatWeekly = req.body.repeatWeekly;
        console.log(`totalDays: ${totalDays}, repeatWeekly: ${repeatWeekly}`);
        const startDay = startDate.getDay();
        for (let index=0; index<repeatWeekly.length; index++) {
            dayOfWeek = repeatWeekly[index];
            console.log(`dayofweek: ${dayOfWeek}`);
            // Determine the day-of-week of the start date
            // let startDay = startDate.getDay();
            // console.log(`startDay: ${startDay}`);
        
            // Calculate the number of days between the start date and the next occurrence of the selected day-of-week
            let delta = (dayOfWeek - startDay + 7) % 7;
            if (delta === 0) {
                delta = 7;
            }
            console.log(`delta: ${delta}`);
        
            // Add the number of days calculated to the start date to get the date of the first occurrence of the selected day-of-week
            let firstDate = startDate.addDays(delta);
            // console.log(`firstDate: ${firstDate}`);
            // let days = Math.floor(totalDays/repeatWeekly.length);
            // let mod = totalDays % repeatWeekly.length;
            // if (mod !== 0) {
            //     console.log(`[1]index: ${index}, mod: ${mod}, days: ${days}`);
            //     days = index < mod ? days+1: days;
            //     console.log(`[2]index: ${index}, mod: ${mod}, days: ${days}`);

            // }
            let days = totalDays % repeatWeekly.length == 0? 
                totalDays/repeatWeekly.length: totalDays%repeatWeekly.length;
            console.log(`days: ${days}`);
            // Generate the dates of all subsequent occurrences of the selected day-of-week until the total number of days is reached
            for (let i = 0; i < days; i++) {
                dates.push(firstDate.addDays(i*7));
                if(startDay === dayOfWeek){
                    i=1;
                    dates.push(startDate);
                }
            }
        }
        dates.sort((a, b) => a - b);
        console.log(`dates1: ${dates}`);
        console.log(`totalDays: ${totalDays}, dates: ${dates.length}`);
        if(dates.length > totalDays){
            let gap = dates.length - totalDays;
            for(let j=0; j<gap; j++){
                dates.pop();
            }
            console.log(`dates2: ${dates}`);
        }
        if(dates.length != totalDays) {
            console.log(`dates3: ${dates}`);
            res.status(500);
            throw new Error('Wrong Calculated dates');
        }
    }

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
const deleteProgram = asyncHandler(async (req, res) => {
    const program = await Program.findOneAndDelete(req.params.id);
    if(!program) {
        res.status(400);
        throw new Error('Program not found');
    }
    // const deletedProgram = await Program.findByIdAndRemove(req.params.id, req.body);
    // res.status(200).json({ message: `Delete program ${deletedProgram.name}`});
});

Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function calTotalDuration(workouts) {
    let totalDuration = 0;
    workouts.forEach((item)=>{
        totalDuration += item.youtubeVid.duration;
    });
    return totalDuration;
}

module.exports = {
    getPrograms, getThisProgram, createProgram, updateProgram, deleteProgram
}