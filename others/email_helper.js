var nodemailer = require('nodemailer'),
    Q          = require('q');

var transporter = nodemailer.createTransport({
    service: 'Yahoo',
    auth: {
        'user': process.env.YAHOO_USER || '',
        'pass': process.env.YAHOO_PWD || ''
    }
})

// Q
var q_sendMail = Q.nbind(transporter.sendMail, transporter)

var email_helper = {

    send_log_email: function (email, title, text, callback){

        var mailOptions = {
            from: '新聞，舊聞。 <shenyepoxiao@yahoo.com>',
            to: email,
            subject: title,
            text: text
        }
        q_sendMail(mailOptions)
        .then(function (info){
            log.info('[Forgot: Send Log Mail Success]', info.response)
            if (callback){
                callback()
            }
        }, function (err){
            log.error('[Forgot: Send Log Mail Wrong]', err)
        })
    }
}



module.exports = email_helper