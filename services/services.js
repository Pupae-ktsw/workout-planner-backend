function generateDates(startDate, frequently, totalDays) {
    var dates = [];
    if(typeof frequently === 'number'){
        let startDay = startDate;
        for(let i=0; i<totalDays; i++){
            dates.push(startDay);
            startDay = startDay.addDays(frequently);
        }
        startDay = null;
    }
    else if (Array.isArray(frequently)){
        frequently.sort((a,b)=> a-b);
        console.log(`totalDays: ${totalDays}, repeatWeekly: ${frequently}`);
        let startDay = startDate.getDay();
        let ind = frequently.findIndex(
            x => x >= startDay);
        if(ind < 0){
            startDate = startDate.addDays(frequently[0] - startDay + 7);
            startDay = frequently[0];
        }else {
            frequently = splitArr(frequently, frequently[ind]);
        }
        console.log(`newFreq: ${frequently}`);

        const mapDate = new Map();
        let days = Math.floor(totalDays/frequently.length);
        let dayMod = totalDays%frequently.length;
        console.log(`days: ${days}, dayMod: ${dayMod}`);

        for (let index=0; index<frequently.length; index++) {
            let dayOfWeek = frequently[index];
            // console.log(`dayofweek: ${dayOfWeek}`);
        
            // Calculate the number of days between the start date and the next occurrence of the selected day-of-week
            let delta = (dayOfWeek - startDay + 7) % 7;
            if (delta === 0) {
                delta = 7;
            }
            // console.log(`delta: ${delta}`);
        
            // Add the number of days calculated to the start date to get the date of the first occurrence of the selected day-of-week
            let firstDate = startDate.addDays(delta);
            if (startDay === dayOfWeek){
                firstDate = startDate;
            }
            // console.log(`firstDate: ${firstDate}`);
            let dayTemp = days;
            if(dayMod != 0 && index < dayMod){
                dayTemp++;
            }
            // console.log(`dayTemp: ${dayTemp}`);
            let endDate = firstDate.addDays((dayTemp-1)*7);
            mapDate.set(firstDate.getTime(), endDate.getTime());
        }
        startDay = null;
        days = null;
        dayMod = null;
        const keyArr = Array.from(mapDate.keys()); //getTime
        // console.log(`keyArrlength: ${keyArr.length}, keyArr: ${keyArr}`);
        let weekNo = 0;
        let k = 1;
        console.log(`loop: ${totalDays-(keyArr.length*2)}`);
        for(let j=0; j<totalDays-(keyArr.length*2); j++) {
            console.log(`----------round: ${j}--------------`);
            let next = new Date(keyArr[weekNo]).addDays(7*k); //Date
            console.log(`next: ${next}`);
            dates.push(next.getTime());
            if(next <  new Date(mapDate.get(keyArr[weekNo])).addDays(-7)){ //Date
                k++;
                console.log(`if j=${j}, k=${k}, weekNo=${weekNo}`);
            }else {
                weekNo++;
                k=1;
                console.log(`else j=${j}, k=${k}, weekNo=${weekNo}`);
            }
        }
        dates = dates.concat(Array.from(mapDate.values()));
        dates = dates.concat(keyArr);
        dates.sort((a,b) => a-b);
        dates = new Set( dates );
        dates = Array.from(dates).map(e=> new Date(e));
        console.log(`totalDays: ${totalDays}, dates: ${dates.length}`);
    }
    return dates;
}



function splitArr(arr, num){
    let index = arr.indexOf(num);
    let first = arr.slice(index);
    let second = arr.slice(0, index);
    index = null;
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