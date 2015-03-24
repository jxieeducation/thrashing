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
	owner: { type:Schema.ObjectId, ref:"User" },
  	contributors: [{ type:Schema.ObjectId, ref:"User" }],
  	changes: [{ type:Schema.ObjectId, ref:"Change" }]
})
tutorialSchema.plugin(elmongo);
var Tutorial = mongoose.model('Tutorial', tutorialSchema);

var change_status = {
	'closed_applied': 1,
	'closed_not_applied': 2,
	'open': 3
};
var change_status_meaning = {
	1: 'closed_applied',
	2: 'closed_not_applied',
	3: 'open'
}
var changeSchema = Schema({
	status: Number,
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
	change_status: change_status,
	change_status_meaning: change_status_meaning,
	Tutorial: Tutorial,
	User: User,
	Change: Change,
};
