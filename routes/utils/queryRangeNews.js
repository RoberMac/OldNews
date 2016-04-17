'use strict';
const ONE_HOUR = 1000 * 60 * 60;

module.exports = (date, country, range) => {
    let minDate = date;
    let maxDate = date + range * ONE_HOUR;

    if (date % ONE_HOUR === 0 && range !== 24) {
        minDate -= ONE_HOUR;
        maxDate -= ONE_HOUR;
    }

    return promiseNewsAggregate(
        {
            $match: {
                date: {
                    $gt : minDate,
                    $lte: maxDate,
                },
            },
        }, // Match News
        { $project: { selectCountry: `$${country}` } }, // Select Country News
        { $unwind: '$selectCountry' },
        {
            $group: {
                _id    : '$selectCountry.source_name',
                newsSet: { $addToSet: '$selectCountry.news' },
            },
        }, // Group By Source
        { $unwind: '$newsSet' },
        { $unwind: '$newsSet' },
        {
            $group: {
                _id    : '$_id',
                newsSet: { $addToSet: '$newsSet' },
            },
        }, // Group By Source
        {
            $project: {
                source_name: '$_id',
                news       : '$newsSet',
                _id        : 0,
            },
        }
    );
};
