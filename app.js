//local variables
var express    = require('express'),
    fs         = require('fs'),
    app        = express(),
    res_time   = require('response-time'),
    favicon    = require('serve-favicon'),
    bodyParser = require('body-parser'),
    http       = require('http').Server(app),
    mongoose   = require('mongoose'),
    helmet     = require('helmet'),
    compress   = require('compression'),
    Log        = require('log'),
    touch      = require('touch');

// load dotenv
require('dotenv').load()

// Log
var log_file     = __dirname + '/logs/' + new Date().toUTCString() + '.log',
    email_helper = require('./others/email_helper');

touch(log_file, function (){
    log_reader = new Log('info',  fs.createReadStream(log_file))
    log_reader.on('line', function (data){
        if (data.level <= 4){
            // 發送郵件提醒
            // email_helper.send_log_email('shenyepoxiao@gmail.com', '[news.shenyepoxiao.com]服務器出現錯誤', data.msg)
        } else {
            console.log(data.date, data.msg)
        }
    })
})

// global variables
global.Q    = require('q')
global.News = require('./models/db').News
global.log  = new Log('info', fs.createWriteStream(log_file))

process.on('uncaughtException', function (err) {
    log.alert(err.toString('utf8'));
    // 發送郵件提醒
    // email_helper.send_log_email('shenyepoxiao@gmail.com', '[news.shenyepoxiao.com]服務器出現錯誤', err.stack, function (){
    //     process.exit(1)
    // })
});

// read database config form VCAP_SERVICES env
var db_uri = process.env.MONGODB
    ? JSON.parse(process.env.MONGODB).uri
    : 'mongodb://test:test@localhost:27017/test'

// Connect to DB
mongoose.connect(db_uri);

var db = mongoose.connection
.on('err', function (err){
    console.log(err)
})
.once('open', function (){
    log.info('[DB]', 'Connected to MongoDB')
})

// App Settings
app.set('trust proxy', true)

// Middleware
app.use(compress())
app.use(bodyParser.json())
app.use(res_time())
app.use(favicon(__dirname + '/public/img/favicon.ico'))
app.use(helmet())
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))
app.use(helmet.contentSecurityPolicy({
    defaultSrc: ["'self'"],
    // scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    // styleSrc: ["'self'", "http://*.qbox.me.com"],
    imgSrc: ["*"],
    connectSrc: ['*'],
    reportOnly: false, // set to true if you only want to report errors
    setAllHeaders: false, // set to true if you want to set all headers
    disableAndroid: false, // set to true if you want to disable Android (browsers can vary and be buggy)
    safari5: false // set to true if you want to force buggy CSP in Safari 5
}));

// Routing
app.use('/', require('./routes/index'))
app.use('/public', express.static('public'))
app.use('/api', require('./routes/api'))


// Handing 404
app.use(function (req, res){
    log.warning('[404: ' + req.originalUrl + ']')
    res.status('404').sendFile(__dirname + '/views/404.html')
})

// Handing 400
app.use(function (err, req, res, next){
    if (err.code === 400){
        log.warning('[400]', err)
        res.status(400).json({'status': 'error', 'msg': err.msg})
    } else {
        next(err)
    }
})

// Handing 500
app.use(function (err, req, res, next){
    if (err.code === 500){
        log.error('[500]', err)
        res.status(500).json({'status': 'error', 'msg': err.msg})
    } else {
        next(err)
    }
})

// Handing 401
app.use(function (err, req, res, next){
    for (var i in err){
        log.warning('[401]', err)
    }
    if (err.status === 401){
        res.status(401).json({'status': 'error','msg': err.message})
    } else {
        next(err)
    }
})

http.listen(process.env.PORT || 3000, function (){
    log.info('[App] is running')
})
