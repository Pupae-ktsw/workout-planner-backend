function generateDates(startDate, frequently, totalDays) {
    const dates = [];
    if(typeof frequently === 'number'){
        let startDay = startDate;
        for(let i=0; i<totalDays; i++){
            dates.push(startDay);
            startDay = startDay.addDays(frequently);
        }
    }
    else if (Array.isArray(frequently)){
        frequently.sort((a,b)=> a-b);
        console.log(`totalDays: ${totalDays}, repeatWeekly: ${frequently}`);
        const startDay = startDate.getDay();
        let ind = frequently.findIndex(
            x => x >= startDay);
        if(ind < 0){
            startDay = frequently[0];
        }else {
            frequently = splitArr(frequently, startDay);
        }
        console.log(`newFreq: ${frequently}`);
        
        const days = Math.floor(totalDays/frequently.length);
        var dayMod = totalDays%frequently.length;
        console.log(`days: ${days}, dayMod: ${dayMod}`);
        for (let index=0; index<frequently.length; index++) {
            dayOfWeek = frequently[index];
            // console.log(`dayofweek: ${dayOfWeek}`);
        
            // Calculate the number of days between the start date and the next occurrence of the selected day-of-week
            let delta = (dayOfWeek - startDay + 7) % 7;
            if (delta === 0) {
                delta = 7;
            }
            // console.log(`delta: ${delta}`);
        
            // Add the number of days calculated to the start date to get the date of the first occurrence of the selected day-of-week
            let firstDate = startDate.addDays(delta);
            // console.log(`firstDate: ${firstDate}`);
            let dayTemp = days;
            if(dayMod != 0 && index < dayMod){
                dayTemp++;
            }
            // console.log(`dayTemp: ${dayTemp}`);

            // Generate the dates of all subsequent occurrences of the selected day-of-week until the total number of days is reached
            for (let i = 0; i < dayTemp; i++) {
                dates.push(firstDate.addDays(i*7));
                if(startDay === dayOfWeek){
                    i=1;
                    dates.push(startDate);
                }
            }
        }
        dates.sort((a, b) => a - b);
        // console.log(`dates1: ${dates}`);
        console.log(`totalDays: ${totalDays}, dates: ${dates.length}`);
        // if(dates.length > totalDays){
        //     let gap = dates.length - totalDays;
        //     for(let j=0; j<gap; j++){
        //         dates.pop();
        //     }
        //     console.log(`dates2: ${dates}`);
        // }
    }
    return dates;
}

function splitArr(arr, num){
    const index = arr.indexOf(num);
    const first = arr.slice(index);
    const second = arr.slice(0, index);
    return first.concat(second);
}

Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

module.exports = {
    generateDates
}