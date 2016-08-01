var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Blog');
var Schema = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
});

var blogSchema = new Schema({
    username: String,
    password: String,
    email: String
});

var Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

