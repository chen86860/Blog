/**
 * Created by jack on 8/5/16.
 */

var express = require('express');
var router = express.Router();
var mon= require('../models/mongonDb');
mon.


router.route('/')
    .get(function (req, res, next) {
        res.render('test');
    })
    .post(function (req, res, next) {
        var username = req.body.username;
        userprofile.find({username: username}, function (err, result) {
            if (err)return console.error(err);
            if (result && result != null) {
                res.render('test', {
                    result: result
                })
            }
        })
    });


module.exports = router;