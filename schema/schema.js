var mongoose = require('mongoose');
var Schema =mongoose.Schema;
var relationship = require('mongoose-relationship');
mongoose.connect('mongodb://localhost/thrashing');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
});

var tutorialSchema = Schema({
	name: String,
	description: String,
	content: String,
	lastChanged: Date,
  	contributors: [{ type:Schema.ObjectId, ref:"User", childPath:"tutorials" }]
})
tutorialSchema.plugin(relationship, { relationshipPathName:'contributors' });
var Tutorial = mongoose.model('Tutorial', tutorialSchema);

var userSchema = Schema({
	email: String,
	password: String,
  	tutorials: [{ type:Schema.ObjectId, ref:"Tutorial", childPath:"contributors" }]
})
userSchema.plugin(relationship, { relationshipPathName:'tutorials' });
var User = mongoose.model('User', userSchema);

module.exports = {
	Tutorial: Tutorial,
	User: User,
};
