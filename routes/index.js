var platform  = require('platform'),
    router    = require('express').Router();

router.get(['/'], function (req, res, next){

    log.info('[GET: /]', req.ip)

    platform.parse(req.get('user-agent')).name === 'IE'
    ? res.redirect(process.env.PWD + '/views/404.html')
    : res.sendFile(process.env.PWD + '/views/index.html')
})

module.exports = router