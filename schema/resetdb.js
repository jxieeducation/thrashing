var schema = require('./schema.js');

function clean(){
	schema.Tutorial.remove(function (err) {
    	if (err) {
      		console.log(err);
    	}
  	});
  	schema.User.remove(function (err) {
    	if (err) {
      		console.log(err);
    	}
  	});
}

clean();
