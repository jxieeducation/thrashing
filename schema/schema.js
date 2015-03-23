var mongoose = require('mongoose');
var Schema =mongoose.Schema;
var elmongo = require('elmongo');
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
	vote_score: Number,
	votes: [{ ip:String, vote:Boolean }],
  	contributors: [{ type:Schema.ObjectId, ref:"User" }],
  	changes: [{ type:Schema.ObjectId, ref:"Change" }]
})
tutorialSchema.plugin(elmongo);
var Tutorial = mongoose.model('Tutorial', tutorialSchema);

var changeSchema = Schema({
	time: Date,
	oldContent: String,
	newContent: String,
	tutorial: { type:Schema.ObjectId, ref:"Tutorial" },
	creator: { type:Schema.ObjectId, ref:"User" }
})
var Change = mongoose.model('Change', changeSchema);

var userSchema = Schema({
	email: String,
	password: String,
  	tutorials: [{ type:Schema.ObjectId, ref:"Tutorial" }],
  	changes: [{type:Schema.ObjectId, ref:"Change"}]
})
var User = mongoose.model('User', userSchema);

module.exports = {
	Tutorial: Tutorial,
	User: User,
	Change: Change,
};
