var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./schema/schema.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    schema.User.find().sort({_id:-1}).exec(function(err, users){
        schema.Tutorial.find().sort({_id:-1}).exec(function(err, tutorials){
            var output = {num_users: users.length, num_tutorials: tutorials.length, latest_user: users[0], latest_tutorial: tutorials[0]};
            res.json(output);
        });
    });
})

var server = app.listen(8001, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('listening at http://%s:%s', host, port)
})
