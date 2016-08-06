var mongoose = require('mongoose');
var credentials = require('../lib/credentials');

// mongoose.Promise = global.Promise;
// mongoose.createConnection(credentials.mongo.development.connectString);
// mongoose.createConnection("mongodb://localhost/Blog");
mongoose.connect(credentials.mongo.development.connectString);

var Schema = mongoose.Schema;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    //succeed
});

var articleSchema = new Schema({
    id: String,
    username: String,
    createTime: String,
    title: String,
    contentSummary: String,
    content: String
});

//Blog schema
var blogSchema = new Schema({
    uid: String,
    username: String,
    password: String,
    email: String,
    createTime: String,
    createRegionIP: String
});


//userprofile
var userinfo = new Schema({
    uid: String,
    avar: String,
    telNum: String,
    IMIE: String
});


//向外界提供接口
exports.userDoc = mongoose.model('userDoc', blogSchema);

exports.userprofile = mongoose.model('userprofile', userinfo);

exports.article = mongoose.model('articles', articleSchema);