var router = require('express').Router(),
    api_db_helper = require('../others/api_db_helper');


// Middleware
router.post('/getSelectedDateNews', function (req, res, next){

    log.info('[POST: /getSelectedDateNews]', req.body)
    api_db_helper.getSelectedDateNews(req.body, res, next)
})

module.exports = router