var router = require('express').Router(),
    api_db_helper = require('../others/api_db_helper');


router.post('/getSelectedDateNews', function (req, res, next){

    log.info(req.body.selectDate, req.body.selectCountry, req.body.isAllDay, req.ip)
    api_db_helper.getSelectedDateNews(req.body, res, next)
})

module.exports = router