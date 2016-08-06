var express = require('express');
var router = express.Router();
var credentials = require('../lib/credentials');
var nodemailer = require('nodemailer');
var md5 = require('../node_modules/md5');
var uuid = require('uuid');
var ip = require('ip');
var userDoc = require('../models/mongonDb').userDoc;


/* GET users listing. */
router.get('/', function (req, res, next) {
    if (req.session.userinfo) {
        res.render('usercenter', {
            usename: req.session.userinfo
        });
    } else {
        res.redirect('/');
    }
});


router.route('/logout')
    .get(function (req, res, next) {
        req.session.userinfo = null;
        res.redirect('/');
    });

router.route('/signup')
    .get(function (req, res, next) {
        if (req.session.userinfo) {
            res.redirect('/');
        } else {
            res.render('signup');
        }

    })
    .post(function (req, res, next) {
        if (req.session.userinfo) {
            res.redirect('/')
        } else {
            var xhrflag = false;
            if (req.xhr) {
                xhrflag = true;
            }
            if (req.body.email.match(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/)) {
                //或查询
                // userDoc.find({$or: [{username: req.body.username}, {email: req.body.email}]}, function (err, result) {

                userDoc.find({email: req.body.email}, function (err, result) {
                    if (err) return console.error(err);
                    if (result.length > 0) {
                        if (xhrflag) {
                            res.send('bad')
                        } else {
                            res.render('signup', {
                                status: "bad",
                                details: "The email address is exist.please try another one!"
                            });
                        }
                    }
                    else {
                        var uid = uuid.v4();
                        var myDate = new Date();
                        var newuser = new userDoc({
                            uid: uid,
                            password: md5(req.body.password + req.body.email),
                            email: req.body.email,
                            createTime: myDate.toLocaleDateString(),
                            createReginIP: ip.address()

                        });
                        //增加数据
                        newuser.save(function (err, newuser) {
                            if (err) return console.error(err);
                            else {
                                if (xhrflag) {
                                    res.send('ok');
                                }
                                else {
                                    res.render('signup', {
                                        status: 'OK',
                                        details: "signup is OK,enjoy please :D"
                                    })
                                }
                                req.session.userinfo = {
                                    username: "",
                                    uid: uid,
                                    email: req.body.email
                                }
                            }
                        })
                    }
                })
            }
            else {
                if (xhrflag) {
                    res.send('bad');
                } else {
                    res.render('signup', {
                        status: "BAD",
                        details: "email address is invalid"
                    })
                }
            }
        }
    });


router.route('/login')
    .get(function (req, res, next) {
        res.render('login');
    })
    .post(function (req, res, next) {
        var user = {
            username: req.body.username,
            password: md5(req.body.password)
        };
        //查询数据
        userDoc.find(user, function (err, result) {
            if (err) return console.error(err); else {
                if (result[0] && (md5(req.body.password) == result[0].password)) {
                    result[0].password = "*";
                    // req.session=result[0];
                    req.session.userinfo = result[0];
                    res.send('ok');
                } else {
                    res.send('bad');
                }
            }
        });

        //count计数，返回查询结果
        // userDoc.count(newuser, function (err, result) {
        //     if (err) return console.log(err);
        //     res.render('login', {
        //         loginstatus: result
        //     })
        // })
    });

router.route('/update')
    .get(function (req, res, next) {
        if (req.session.userinfo) {
            res.render('update');
        }
        else {
            res.redirect('/');
        }
    })

    .post(function (req, res) {
        var oldpassword = {
            password: req.body.oldpassword
        };
        var newpassword = {
            $set: {
                password: req.body.newpassword
            }
        };

        // userDoc.update()
        userDoc.update(oldpassword, newpassword, function (err, result) {
            if (err) return console.log(err);
            res.render('update', {
                // oldpsw: req.body.oldpassword,
                newpsw: req.body.newpassword,
                result: result
            })
        })
    });

router.route('/remove')
    .get(function (req, res, next) {
        res.render('remove')
    })
    .post(function (req, res, next) {
        var removeitem = {
            username: req.body.username
        };

        userDoc.remove(removeitem, function (err, result) {
            if (err) return console.error(err);
            res.render('remove', {
                status: result
            });
        })
    });

router.route('/sendmail')
    .get(function (req, res) {
        if (req.session && req.session.userinfo) {
            res.render('sendmail');
        }
        else {
            res.redirect('/');
        }
    })
    .post(function (req, res) {
            if (req.session.userinfo == null) {
                res.redirect('/');
            } else {
                if (req.body.recipients.match(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/) != null) {
                    var recipients = req.body.recipients;
                    var subject = req.body.subject == "" ? "(No Subject)" : req.body.subject;
                    var content = req.body.content == "" ? "" : req.body.content;
                    sendMail(recipients, subject, content, 'html', function (status, details) {
                        if (status == 'err') {
                            if (req.xhr) {
                                res.send({
                                    statusCode: 202,
                                    details: details
                                })
                            } else {
                                res.render('sendmail', {
                                    status: "发送失败.",
                                    details: details
                                })
                            }
                        } else if (status == 'ok') {
                            if (req.xhr) {
                                res.send("OK");
                            } else {
                                res.render('sendmail', {
                                    status: '发送成功！',
                                    details: details
                                })
                            }
                        }
                    });
                }
                else {
                    res.render('sendmail', {
                        status: '邮箱格式不正确哈～',
                        details: "邮箱格式错误。再检查遍哈～"
                    })
                }
            }
        }
    );


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

//
// //online user
// var onlineUsers = {};
// //online user count
// var onlineCount = 0;
//
// //init socket.io
// var io = require('socket.io').listen(server);
//
// io.on('connect', function (socket) {
//     console.log('a user connected');
//
//     //创建事件监听
//     socket.on('login', function (msg) {
//         //标识用户的唯一id
//         socket.name = msg.userId_;
//         if (!onlineUsers.hasOwnProperty(msg.userId_)) {
//             onlineUsers[msg.userId_] = msg.username;
//             onlineCount++;
//         }
//
//         io.emit('chat message', {
//                 onlineUsers: onlineUsers,
//                 onlineCount: onlineCount,
//                 user: msg
//             }
//         );
//
//         io.emit('chat message', msg);
//     });
//
//     //监听用户退出
//     socket.on('discount', function () {
//         //将退出的用户从在线列表删除
//         if (onlineUsers.hasOwnProperty(socket.name)) {
//             var obj = {
//                 userid_: socket.name,
//                 username: onlineUsers[socket.name]
//             };
//
//             //删除
//             delete onlineUsers[socket.name];
//
//             //在线人数减一
//             onlineCount--;
//
//             //向所有用户广播用户退出
//             io.emit('logout', {
//                 onlineUsers: onlineUsers,
//                 onlineCount: onlineCount,
//                 user: obj
//             });
//         }
//
//
//     });
//
//     socket.on('message', function (obj) {
//         //向所有用户广播信息
//         io.emit('message', obj);
//         console.log(obj.username + 'say:' + obj.content);
//     })
// });

// io.on('connect', function (socket) {
//     socket.broadcast.emit('hi');
// });


module.exports = router;