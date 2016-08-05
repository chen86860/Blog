/**
 * Created by jack on 8/5/16.
 */

var express = require('express');
var router = express.Router();
var userprofile = require('../models/mongonDb').userprofile;
var uuid = require('uuid');

router.route('/')
    .get(function (req, res, next) {
        res.render('test');
    })
    .post(function (req, res, next) {
        var tel = req.body.tel;
        userprofile.find({telNum: tel}, function (err, result) {
            if (err)return console.error(err);
            if (result && result != null) {
                res.render('test', {
                    result: result
                })
            }
        })
    });

router.route('/add').get(function (req, res, next) {
    res.render('add')
})
    .post(function (req, res, next) {

        var data = new userprofile({
            uuid: uuid.v4(),
            avar: req.body.avar,
            telNum: req.body.tel,
            IMIE: req.body.IMIE
        });

        data.save(function (err, result) {
            if (err) return console.error(err);
            res.render('add',
                {
                    result: result
                }
            )
        })
    });


module.exports = router;