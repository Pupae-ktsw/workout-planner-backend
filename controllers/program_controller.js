// for handling error without using try/catch
const asyncHandler = require('express-async-handler');

const Program = require('../models/program_model');
const DayOfProgram = require('../models/dayOfProgram_model');
const CalendarEvents = require('../models/calendarEvent_model');

// @desc    Get Programs
// @route   GET /programs
// @access  Private
const getPrograms = asyncHandler(async (req, res) => {
    const programs = await Program.find();

    res.status(200).json(programs);
});

// @desc    Get Specific Programs
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
    console.log(req.body);
    const {programName, color, workoutTime,
        isReminder, repeatType, thumbnail} = req.body;
    const daysProgram = req.body.dayOfProgram;
    const totalDays = daysProgram.length;
    const startDate = new Date(Date.now());
   
    startDate.setHours(workoutTime.split(':')[0]);
    startDate.setMinutes(workoutTime.split(':')[1]);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    console.log(`startDate: ${startDate}`);
    // TO DO: validation fields and warning to program req.body.<fieldNameJSON>
    if(!req.body) {
        res.status(400);
        throw new Error('No Request body');
    }
    if(!daysProgram){
        res.status(400);
        throw new Error('Miss day of program');
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
        for (dayOfWeek of repeatWeekly) {
            // Determine the day-of-week of the start date
            let startDay = startDate.getDay();
        
            // Calculate the number of days between the start date and the next occurrence of the selected day-of-week
            let delta = (dayOfWeek - startDay + 7) % 7;
            if (delta === 0) {
                delta = 7;
            }
        
            // Add the number of days calculated to the start date to get the date of the first occurrence of the selected day-of-week
            let firstDate = startDate.addDays(delta);
            let days = totalDays % repeatWeekly.length == 0? totalDays/repeatWeekly.length: totalDays%repeatWeekly.length;
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
    }
    console.log(`This is dates: ${dates}`);

    const program = await Program.create({
        programName: programName,
        // playlistURL: createPlaylist(),
        programStatus: 'Challenging',
        startEndDate: [{startDate: startDate}],
        color: color,
        workoutTime: workoutTime,
        isReminder: isReminder,
        remindBf: isReminder? req.body.remindBf:null,
        remindAf: isReminder? req.body.remindAf:null,
        repeatType: repeatType,
        repeatDaily: repeatType == 'Daily'? req.body.repeatDaily: null,
        repeatWeekly: repeatType == 'Weekly'? req.body.repeatWeekly: null,
        totalDays: totalDays,
        thumbnail: thumbnail,
        latestDay: 1,
        // day_id: body.day_id,
        user_id: req.user.id
    });
    if(totalDays == dates.length){
        var dayOfProgram = [];
        daysProgram.forEach(async (item, index, arr) => {
            let workouts = item.workouts;
            let workoutArr = [];
            workouts.forEach((workout) => {
                workoutArr.push({youtubeVid: {
                    url: workout.youtubeVid.url,
                    thumbnail: workout.youtubeVid.thumbnail,
                    title: workout.youtubeVid.title,
                    channel: workout.youtubeVid.channel,
                    duration: workout.youtubeVid.duration}});
            })
            let dayPg = await DayOfProgram.create({
                program_id: program._id,
                numberOfDay: item.numberOfDay,
                totalDuration: calTotalDuration(workouts),
                dateCalendar: dates[index],
                workouts: workoutArr
            });
            dayOfProgram.push(dayPg);
            // let events = await CalendarEvents.updateOne(
            //     {eventDate: dates[index]})
        });    
    }
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

// @desc    Delete Programs
// @route   DELETE /programs/:id
// @access  Private
const deleteProgram = asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id);
    if(!program) {
        res.status(400);
        throw new Error('Program not found');
    }
    const deletedProgram = await Program.findByIdAndRemove(req.params.id, req.body);
    res.status(200).json({ message: `Delete program ${deletedProgram.name}`});
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