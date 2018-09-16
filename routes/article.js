var express = require('express')
var router = express.Router()
var shortid = require('shortid')
var article = require('../models/mongonDb').article

router
  .route('/')
  .get(function(req, res, next) {
    var perPage = 5
    var page = 0

    article
      .find({})
      .limit(perPage)
      .skip(perPage * page)
      .exec(function(err, results) {
        article.count().exec(function(err, count) {
          if (err) return console.error(err)
          res.render('article', {
            article: results,
            count: count,
            page: page,
          })
        })
      })
  })
  .post(function(req, res, next) {
    var perPage = 5
    var page = Math.max(0, req.body.page)
    article
      .find({})
      .limit(perPage)
      .skip(perPage * page)
      .exec(function(err, results) {
        article.count().exec(function(err, count) {
          if (err) return console.error(err)
          // for (i = 0; i < results.length; i++) {
          //     results[i].content = (JSON.stringify(results[i].content)).substr(0, 200);
          // }
          res.jsonp({
            article: results,
            count: count,
            page: page + 1,
          })
        })
      })
  })

router
  .route('/post')
  .get(function(req, res, next) {
    if (req.session.userinfo) {
      res.render('goo-editor')
    } else {
      res.redirect('/user/login')
    }
  })
  .post(function(req, res, next) {
    // if (req.session.userinfo) {
    var myDate = new Date()
    var newarticle = new article({
      id: shortid.generate(),
      title: req.body.title,
      username: req.session.userinfo.username,
      createTime: myDate.toLocaleDateString(),
      contentSummary: req.body.contentSummary,
      content: req.body.content,
    })
    newarticle.save(function(err, result) {
      if (err) {
        return console.error(err)
      } else {
        if (result && result != null) {
          res.send('ok')
        } else {
          res.send('bad')
        }
      }
    })
    // } else {
    //     res.redirect('/');
    // }
  })

router.route('/:id').get(function(req, res, next) {
  var id = req.params.id
  article.find({ id: id }, function(err, results) {
    if (err) return console.error(err)
    else {
      res.render('articlecontent', {
        article: results,
      })
    }
  })
})

module.exports = router
