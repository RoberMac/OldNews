var platform  = require('platform'),
    router    = require('express').Router();

router.get(['/'], function (req, res, next){

    log.info('[GET: /]', req.ip)

    platform.parse(req.get('user-agent')).name === 'IE'
    ? res.redirect(process.env.PWD + '/views/404.min.html')
    : res.sendFile(process.env.PWD + '/views/index.min.html')
})

module.exports = router