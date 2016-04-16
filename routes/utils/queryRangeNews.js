module.exports = (date, country, range) => promiseNewsAggregate(
    {
        $match: {
            date: {
                $gte: date,
                $lte: date + range * 1000 * 60 * 60,
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
