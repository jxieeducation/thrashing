var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/thrashing');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
});

var tutorialSchema = mongoose.Schema({
	name: String,
	description: String,
	content: String
})

var Tutorial = mongoose.model('Tutorial', tutorialSchema);

function clean(){
	Tutorial.remove(function (err) {
    	if (err) {
      		console.log(err);
    	}
  	});

}

// clean();

module.exports = {
	Tutorial: Tutorial,
};
