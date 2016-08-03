var express = require('express');
var router = express.Router();
var shortid = require('shortid');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Blog');
var Schema = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

var articleSchema = new Schema({
    id: String,
    username: String,
    createTime: String,
    title: String,
    content: String
});

var article = mongoose.model('article', articleSchema);

router.route('/')
    .get(function (req, res, next) {
        var perPage = 5;
        var page = 0;

        article.find({})
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, results) {
                article.count().exec(function (err, count) {
                    if (err)return console.error(err);
                    for (i = 0; i < results.length; i++) {
                        results[i].content = (JSON.stringify(results[i].content)).substr(0, 200);
                    }
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
        article.find({})
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, results) {
                article.count().exec(function (err, count) {
                    if (err)return console.error(err);
                    for (i = 0; i < results.length; i++) {
                        results[i].content = (JSON.stringify(results[i].content)).substr(0, 200);
                    }
                    res.jsonp({
                        article: results,
                        count: count,
                        page: page + 1
                    }
                    );
                })
            })

    });

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
                id: shortid.generate(),
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

router.route('/:id')
    .get(function (req, res, next) {
        var id = req.params.id;
        article.find({id: id}, function (err, results) {
            if (err) return console.error(err);
            else {
                res.render('articlecontent', {
                    article: results
                });
            }
        });
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


module.exports = router;