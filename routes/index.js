var platform  = require('platform'),
    router    = require('express').Router();

router.get(['/*'], function (req, res, next){

    platform.parse(req.get('user-agent')).name === 'IE'
    ? res.send('FUCK IE')
    : res.sendFile(process.env.PWD + '/views/index.html')
})

module.exports = router