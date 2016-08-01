var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var credentials = require('../lib/credentials');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

function sendMail(recipients, subject, content, mailType, callback) {
    var mailType = mailType || 'text';
    // create reusable transporter object using the default SMTP transport

    var transporter = nodemailer.createTransport(credentials.stmp.stmpSecert);

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"Jams" <chen86860@yeah.net', // sender address
        to: recipients, // list of receivers
        subject: subject // Subject line
        // mailType: content // plaintext body
    };
    mailOptions[mailType] = content;

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        var status = '';
        var details = '';
        if (error) {
            status = 'err';
            details = (typeof(info) != 'undefined') ? info : 'Mail Server Refuse'
        }
        else {
            status = 'ok';
            details = (typeof(info) != 'undefined') ? info : 'Mail Server Refuse'
        }

        if (callback && typeof(callback) == 'function') {
            callback(status, details);
        }
    });
}

router.route('/signup')
    .get(function (req, res, next) {
        res.render('signup');
    })
    .post(function (req, res, next) {


    });

router.route('/signup')
    .get(function (req, res, next) {
        res.render('signup');
    })
    .post(function (req, res, next) {
        console.log('Form :' + req.query.form);
        console.log('Name:' + req.body.username);
        console.log('Email:' + req.body.email);
        console.log('Password' + req.body.passwords);
        // res.set('Content-Type','text/html');
        // res.redirect('／');
    });

router.route('/sendmail')
    .get(function (req, res) {
        res.render('sendmail')
    })
    .post(function (req, res) {
            if (req.body.recipients.match(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/) != null) {
                var recipients = req.body.recipients;
                var subject = req.body.subject == "" ? "(No Subject)" : req.body.subject;
                var content = req.body.content == "" ? "" : req.body.content;
                sendMail(recipients, subject, content, 'html', function (status, details) {
                    if (status == 'err') {
                        if (req.xhr) {
                            // res.send('BAD');
                            res.send("BAD")
                        } else {
                            res.render('sendmail', {
                                status: "发送失败.",
                                content: details
                            })
                        }
                    } else if (status == 'ok') {
                        if (req.xhr) {
                            res.send("OK");
                        } else {
                            res.render('sendmail', {
                                status: '发送成功！',
                                content: details
                            })
                        }
                    }
                });
            }
            else {
                res.render('sendmail', {
                    status: '邮箱格式不正确哈～'
                })
            }
        }
    );
module.exports = router;