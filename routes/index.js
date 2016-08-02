var express = require('express');
var router = express.Router();
var fortune = require('../lib/fortune/fortune');


/* GET home page. */
router
    .get('/', function (req, res, next) {
    res.render('index', {title: 'Express', content: 'Hello world'});
});


router.get('/about', function (req, res, next) {
    res.render('about', {
            title: "fortunr",
            content: fortune.getFortune()
        }
    )
});

router.get('/chat', function (req, res, next) {
    res.render('chat');
});

// var items = {
//     "name": "中国",
//     "province": [{
//         "name": "黑龙江",
//         "cities": {
//             "city": ["哈尔滨", "大庆"]
//         }
//     }, {
//         "name": "广东",
//         "cities": {
//             "city": ["广州", "深圳", "珠海"]
//         }
//     }, {
//         "name": "台湾",
//         "cities": {
//             "city": ["台北", "高雄"]
//         }
//     }, {
//         "name": "新疆",
//         "cities": {
//             "city": ["乌鲁木齐"]
//         }
//     }]
// };

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
