'use strict';
const validator = require('validator');

const COUNTRIES = ['BR', 'CN', 'DE', 'FR', 'HK', 'IN', 'JP', 'KR', 'RU', 'TW', 'US'];
const isNumOrNumStr = v => typeof +v === 'number' && !isNaN(+v);

const sanitizeCountry = country => {
    if (country === 'MO') {
        // Macao => Hong Kong
        country = 'HK';
    } else if (country === 'SG' || country === 'MY') {
        // Singapore || Malaysia => Taiwan
        country = 'TW';
    } else if (COUNTRIES.indexOf(country) < 0) {
        // Others invalid country => United States
        country = 'US';
    }

    return country;
};
const sanitizeDate = date => {
    let dateMs;

    if (isNumOrNumStr(date)) { // via http://stackoverflow.com/a/175787
        date = parseInt(date, 10);
        dateMs = (date > 0 && date < Date.now()) ? date : null;
    } else if (validator.isDate(date)) {
        try {
            dateMs = Date.parse(date);
        } catch (e) {
            dateMs = null;
        }
    } else {
        dateMs = null;
    }

    return dateMs;
};
const sanitizeRange = range => {
    let sanitizedRange;

    if (isNumOrNumStr(range)) {
        range = ~~parseInt(range, 10);
        sanitizedRange = (range > 0 && range <= 24) ? range : null;
    } else {
        sanitizedRange = null;
    }

    return sanitizedRange;
};

module.exports = {
    country: sanitizeCountry,
    date   : sanitizeDate,
    range  : sanitizeRange,
};
