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