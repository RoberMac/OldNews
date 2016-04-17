const router = require('express').Router();

// Helpers
const sanitize = require('./utils/sanitize');
const queryRangeNews = require('./utils/queryRangeNews');

// Handing Params
router.param('country', (req, res, next, country) => {
    req.newsCountry = country;
    next();
});
router.param('date', (req, res, next, date) => {
    req.newsDate = date;
    next();
});
router.param('range', (req, res, next, range) => {
    req.newsRange = range;
    next();
});

// Router
router.get('/:country/:date/:range', (req, res, next) => {
    const country = sanitize.country(req.newsCountry);
    const date = sanitize.date(req.newsDate);
    const range = sanitize.range(req.newsRange);

    if (!date) {
        next({ statusCode: 400, msg: 'date is invalid' });
        return;
    }

    if (!range) {
        next({ statusCode: 400, msg: 'range is invalid' });
        return;
    }

    queryRangeNews(date, country, range)
    .then(found => {
        if (found.length === 0) {
            next({ statusCode: 404, msg: 'news not found' });
            return;
        }

        res.send({ msg: found });
    })
    .catch(err => next(err));
});

module.exports = router;
