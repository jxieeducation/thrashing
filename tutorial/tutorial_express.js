var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');
var express = require('express');
var app = express();
var md = require("node-markdown").Markdown;
var bodyParser = require('body-parser');
var flash = require('connect-flash');
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

module.exports = (function(){
    var router = express.Router();

	router.get('/tutorial/:objid', function (req, res){
		var objid = req.param("objid");
		schema.Tutorial.findOne({_id: new ObjectId(objid)}, function(err,obj) {
			res.render('tutorial.jade', {tutorial: obj, user: req.user, tutorial_html:md(obj.content, true)});
		});
	})

	router.get('/new', function (req, res) {
    	if (!req.user){
        	res.redirect('/signin');
        	return;
    	}
		res.render('new.jade', {'user': req.user});
	})

	router.post('/new', function (req, res) {
    	if (!req.user){
        	res.redirect('/signin');
        	return;
    	}
    	var user = req.user;
		var name = req.body.name;
		var description = req.body.description;
		var content = req.body.content;
		var newTutorial = new schema.Tutorial({name:name, description:description, content:content}); 
    	newTutorial.lastChanged = new Date();
    	user.tutorials.push(newTutorial);
    	newTutorial.contributors.push(user);
    	user.save(function (err) {if (err) console.log ('Error. user cant save')});
		newTutorial.save(function (err) {
        	if (err) 
            	console.log ('Error. tutorial cant save')
        	res.redirect('/tutorial/' + newTutorial._id);
        	return;
    	});
	})

	router.get('/edit/:objid', function (req, res){
    	if (!req.user){
        	res.redirect('/signin');
        	return;
    	}
    	var objid = req.param("objid");
    	schema.Tutorial.findOne({_id: new ObjectId(objid)}, function(err,obj) {
        	res.render('edit.jade', {tutorial: obj, user: req.user});
    	});
	})

	router.post('/edit/:objid', function (req, res){
    	if (!req.user){
        	res.redirect('/signin');
        	return;
    	}
    	var user = req.user;
    	var name = req.body.name;
    	var description = req.body.description;
    	var content = req.body.content;

	    var objid = req.param("objid");
    	schema.Tutorial.findOne({_id: new ObjectId(objid)}, function(err,obj) {
        	//if the edit didnt do shit
        	if (obj.name == name && obj.description == description && obj.content == content){
            	res.redirect('/tutorial/' + objid);
            	return;
        	}
        	obj.name = name;
        	obj.description = description;
        	obj.content = content;
        	obj.lastChanged = new Date();
        	if (obj.contributors.indexOf(user._id) == -1){
            	user.tutorials.push(obj);
            	user.save(function (err) {if (err) console.log ('Error. user cant save')});
            	obj.contributors.push(user);
        	}
        	obj.save(function (err) {
            	if (err) 
                	console.log ('Error. tutorial cant save')
            	res.redirect('/tutorial/' + objid);
            	return;
        	});        
    	});
	})

    return router;
})();

