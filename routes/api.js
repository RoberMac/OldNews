var router = require('express').Router(),
    api_db_helper = require('../others/api_db_helper');


router.post('/getSelectedDateNews', function (req, res, next){

    api_db_helper.getSelectedDateNews(req.body, res, next)
})

module.exports = router