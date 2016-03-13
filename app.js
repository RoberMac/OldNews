//local variables
var express    = require('express'),
    fs         = require('fs'),
    app        = express(),
    res_time   = require('response-time'),
    favicon    = require('serve-favicon'),
    bodyParser = require('body-parser'),
    http       = require('http').Server(app),
    mongoose   = require('mongoose'),
    morgan     = require('morgan'),
    helmet     = require('helmet'),
    compress   = require('compression');


// load dotenv
require('dotenv').load()

// global variables
global.Q    = require('q')
global.News = require('./models/db').News

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
    console.log('[DB]', 'Connected to MongoDB')
})

// App Settings
app.set('trust proxy', true)

// Middleware
app.use(compress())
app.use(bodyParser.json())
app.use(res_time())
app.use(favicon(__dirname + '/public/img/favicon.ico'))
app.use(morgan(':remote-addr [:date[clf]] :method :url'))
app.use(helmet())
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))
app.use(helmet.contentSecurityPolicy({
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["*", "data:"],
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


// Handing Error
app.use((err, req, res, next) => {
    console.log(err, err.stack)

    var statusCode = err.statusCode || 500;
    var errObj = Object.prototype.toString.call(err) === '[object Object]'
                    ? err
                : { statusCode: statusCode };

    res.status(statusCode).json(errObj)
})


http.listen(process.env.PORT || 3001, function (){
    console.log('[App] is running')
})
