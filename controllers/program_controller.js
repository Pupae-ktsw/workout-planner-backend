// for handling error without using try/catch
const asyncHandler = require('express-async-handler');

const Program = require('../models/program_model');
const DayOfProgram = require('../models/dayOfProgram_model');

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
    res.status(200).json({ message: `This is program id ${req.params.id}`});
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
    const startDate = Date.now();
    // TO DO: validation fields and warning to program req.body.<fieldNameJSON>
    if(!req.body) {
        res.status(400);
        throw new Error('No Request body');
    }
    var dates = [];
    if(repeatType == 'Daily'){
        let startDay = new Date(startDate);
        for(let i=0; i<totalDays; i++){
            dates.push(startDay);
            startDay = startDay.addDays(req.body.repeatDaily);
        }

    }else if (repeatType == 'Weekly'){
        numWeeks = body.repeatWeekly.length; 
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