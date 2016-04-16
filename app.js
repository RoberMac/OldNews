'use strict';
const Q          = require('q');
const express    = require('express');
const app        = express();
const res_time   = require('response-time');
const favicon    = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const morgan     = require('morgan');
const helmet     = require('helmet');
const compress   = require('compression');

// load dotenv
require('dotenv').load();

// global variables
global.News = require('./models').News;
global.promiseNewsAggregate = Q.nbind(News.aggregate, News);

// Connect to DB
const DB_URI = (
    process.env.MONGODB
        ? JSON.parse(process.env.MONGODB).uri
    : 'mongodb://test:test@localhost:27017/test'
);
mongoose.connect(DB_URI);
mongoose.connection
.on('err', (err) => console.error(err))
.once('open', () => console.log('Connected to MongoDB'));


// App Settings
app.set('trust proxy', true);

// Middlewares
app
.use(compress())
.use(bodyParser.json())
.use(res_time())
.use(favicon(`${__dirname}/public/img/favicon.ico`))
.use(morgan(':remote-addr [:date[clf]] :method :url'))
.use(helmet())
.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))
.use(helmet.csp({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc  : ["'self'", "'unsafe-inline'"],
        scriptSrc : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc    : ['*', 'data:', 'blob:'],
        mediaSrc  : ['*'],
    },
    setAllHeaders : false,
    disableAndroid: false,
}))
.use(helmet.xssFilter())
.use(helmet.frameguard('deny'))
.use(helmet.hsts({
    maxAge           : 10886400000,
    includeSubdomains: true,
    preload          : true,
}));

// Routing
app
.use('/news', require('./routes/news'))
.use('/public', express.static('public'))
.use('/*', (req, res, next) => {
    const UA = req.headers['user-agent'];
    const isIE = /MSIE/i.test(UA);

    if (isIE) {
        res.send('FUCK IE');
    } else {
        res.sendFile(`${__dirname}/index.html`);
    }
});

// Handing Error
app.use((err, req, res, next) => {
    console.log(err, err.stack);

    const statusCode = err.statusCode || 500;
    const errObj = Object.prototype.toString.call(err) === '[object Object]' ? err : { statusCode };

    res.status(statusCode).json(errObj);
});

app.listen(process.env.PORT || 3001);
