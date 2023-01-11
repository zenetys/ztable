/**
 * Format a date to the French standard format (DD/MM/YYYY)
 * @param {*} date - the date to format
 * @returns {string} the formatted date
 */
export function frenchFormat(date) {
    return new Date(date).toLocaleDateString('fr-FR') + ' ~ ' + new Date(date).toLocaleTimeString('fr-FR');
}

// Format: month year (2m3y)
/**
 * Calculate the difference between a date and now, in months and years (ex: 2m3y)
 * @param {*} date - the date to compare
 * @returns {string} the difference between the date and now
 */
export function simpleFormat(date) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let now = new Date();
    let outTimeFormat = formatDateWithMillisecond((now.getTime() - new Date(date).getTime()) / 1000);
    var time = new Date(date).getTime();

    if (outTimeFormat.dayNumber === 0)
        return outTimeFormat.hourNumber + ':' + outTimeFormat.minuteNumber + ':' + outTimeFormat.secondNumber;
    if (outTimeFormat.dayNumber > 0 && outTimeFormat.dayNumber < 1)
        return outTimeFormat.hourNumber + ':' + outTimeFormat.minuteNumber + ':' + outTimeFormat.secondNumber;
    if (outTimeFormat.dayNumber >= 1 && outTimeFormat.dayNumber < 365) {
        return new Date(time).getDate() + ' ' + monthNames[new Date(time).getMonth()];
    }
    if (outTimeFormat.dayNumber > 365) {
        return monthNames[new Date(time).getMonth()] + ' ' + new Date(time).getFullYear();
    }
}

/**
 * Calculate the difference between a date and now, in days, hours, minutes and seconds (ex: 1d5h45m78s)
 * @param {*} date - the date to compare
 * @returns {string} the difference between the date and now
 */
export function compactFormat(date) {
    let now = new Date();
    let outTime = formatDateWithMillisecond((now.getTime() - new Date(date).getTime()) / 1000);

    // if (outTime.dayNumber > 49 )
    //     return '+7weeks';

    let outTimeFormat = [];
    if (outTime.dayNumber > 0 && outTimeFormat.length < 2)
        outTimeFormat.push(outTime.dayNumber + 'd');
    if (outTime.hourNumber > 0 && outTimeFormat.length < 2)
        outTimeFormat.push(outTime.hourNumber + 'h');
    if (outTime.minuteNumber > 0 && outTimeFormat.length < 2)
        outTimeFormat.push(outTime.minuteNumber + 'm');
    if (outTime.secondNumber > 0 && outTimeFormat.length < 2)
        outTimeFormat.push(outTime.secondNumber + 's');

    return outTimeFormat.join('');
}

/**
 * Format a timestamp in seconds to a object with days, hours, minutes and seconds
 * @param {number} second - the timestamp in seconds
 * @returns {{dayNumber: number, hourNumber: number, minuteNumber: number, secondNumber: number}} the formatted timestamp in an object
 */
function formatDateWithMillisecond(second) {
    second = Math.round(second);
    let dayNumber = Math.floor(second / 86400);

    second = second - dayNumber * 86400;
    let hourNumber = Math.floor(second / 3600);

    second = second - hourNumber * 3600;
    let minuteNumber = Math.floor(second / 60);

    second = second - minuteNumber * 60;

    return {
        dayNumber: dayNumber,
        hourNumber: hourNumber,
        minuteNumber: minuteNumber,
        secondNumber: second,
    };
}
