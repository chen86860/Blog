var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost/Blog');
var Schema = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

});

var blogSchema = new Schema({
    uid: String,
    username: String,
    password: String,
    email: String,
    createTime: String,
    createRegionIP: String
});


var userinfo = new Schema({
    uid: String,
    avar: String,
    telNum: String,
    IMIE: String
});



var userDoc = mongoose.model('userDoc', blogSchema);
var userprofile = mongoose.model('userprofile', blogSchema);

module.exports = userDoc;
module.exports = userprofile;