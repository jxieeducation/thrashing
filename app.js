var schema = require('./schema.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ObjectId = require('mongoose').Types.ObjectId;
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.render('index.jade', {});
})

app.get('/new', function (req, res) {
	res.render('new.jade', {});
})

app.post('/new', function (req, res) {
	var name = req.body.name;
	var description = req.body.description;
	var content = req.body.content;
	var newTutorial = new schema.Tutorial({name:name, description:description, content:content});
	newTutorial.save(function (err) {if (err) console.log ('Error on save!')});
	res.redirect('/all');
})

app.get('/all', function (req, res){
	schema.Tutorial.find({}, function(err, tutorials) {
    	res.render('all.jade', {tutorials: tutorials});
    });
})

app.get('/tutorial/:objid', function (req, res){
	var objid = req.param("objid");
	schema.Tutorial.findOne({_id: new ObjectId(objid)}, function(err,obj) {
		res.render('tutorial.jade', {tutorial: obj});
	});
})



var server = app.listen(3000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('listening at http://%s:%s', host, port)
})
