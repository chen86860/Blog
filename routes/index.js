var express = require('express');
var router = express.Router();


/* GET home page. */
router
    .get('/', function (req, res, next) {
        res.render('index', {title: 'Express', content: 'Hello world'});
    });


router.get('/chatroom', function (req, res, next) {
    res.render('inde')
});


var items = {
    'ketchup': '5 tbsp',
    'mustard': '1 tbsp',
    'pickle': '0 tbsp'
};
router.get('/about/me', function (req, res, next) {
    res.render('me', {
        title: "About me",
        content: items
    });
});

//get usragent
router.get('/about/useragent', function (req, res, next) {
    // res.set('Content-Type', 'text.plain');
    var s = '';
    for (var name in req.headers)s += name + ':' + req.headers[name] + '\n';
    res.render('userAgent', {title: "useragent", content: s})
});


module.exports = router;
