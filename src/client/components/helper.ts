type UnitType = 'year'|'month'|'day'|'hour'|'minute'|'second';
// in milliseconds
const units: {[key in UnitType]: number} = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
} as const;

var rtf = new Intl.RelativeTimeFormat('ro', { numeric: 'auto' })

export const getRelativeTime = (d1:Date, d2 = new Date()): string => {
    const elapsed = +d1 - +d2

    // "Math.abs" accounts for both "past" & "future" scenarios
    for (const u in units) {
        if (Math.abs(elapsed) > units[u as UnitType] || u == 'second')
        return rtf.format(Math.round(elapsed/units[u as UnitType]), u as UnitType)
    }
    return '';
}

const cache: {[key: string]: string} = {};

export const date2String = (date: Date | number | string, relative: boolean): string  => {
    if (!date) return '';

    const key = JSON.stringify({date, relative});
    if (!cache[key]) {
        let aDate: Date;
        if (typeof date === 'number') {
            aDate = new Date(0);
            aDate.setUTCSeconds(date);
        } else if (typeof date === 'string') {
            aDate = new Date(date);
        } else {
            aDate = date;
        }
        cache[key] = relative ?  getRelativeTime(aDate) : aDate.toString().substring(0, 15);
    }
    return cache[key];
}