var express = require('express');
var router = express.Router();


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Blog');
var Schema = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

var articleSchema = new Schema({
    username: String,
    createTime: String,
    title: String,
    content: String
});

var article = mongoose.model('article', articleSchema);

router.route('/')
    .get(function (req, res, next) {
        var perPage = 5;
        // var page = Math.max(0, req.body.page);
        var page = 0;

        article.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, results) {
                article.count().exec(function (err, count) {
                    if (err)return console.error(err);
                    res.render('article', {
                        article: results,
                        count: count,
                        page: page
                    });
                })
            })

    })
    .post(function (req, res, next) {
        var perPage = 5;
        var page = Math.max(0, req.body.page);
        // var page = 0;

        article.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, results) {
                article.count().exec(function (err, count) {
                    if (err)return console.error(err);
                    res.jsonp( {
                        article: results,
                        count: count,
                        page: page+1
                    });
                })
            })

    });

// article.find({}, function(err, results) {
//     if (err) return console.error(err);
//     else {
//         res.render('article', {
//             article: results
//         });
//     }
// });

// article.find( { createdOn: { $lte: request.createdOnBefore } } )
//     .limit(10)
//
// article.find({}, function (err, result) {
//     if (err) return console.error(err);
//     else {
//         res.render('article', {
//             article: result
//         });
//     }
// });


router.route('/post')
    .get(function (req, res, next) {
        if (req.session.userinfo) {
            res.render('postAir');
        } else {
            res.redirect('/user/login');
        }
    })
    .post(function (req, res, next) {
        if (req.session.userinfo) {
            var myDate = new Date();
            var newarticle = new article({
                title: req.body.title,
                username: req.session.userinfo.username,
                createTime: myDate.toLocaleDateString(),
                content: req.body.content
            });
            newarticle.save(function (err, result) {
                if (err) {
                    return console.error(err)
                } else {
                    if (result && result != null) {
                        res.redirect('/article')
                    } else {
                        res.render('article', {
                            status: "bad"
                        });
                    }
                }
            });
        } else {
            res.redirect('/');
        }
    });

module.exports = router;