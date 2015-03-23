var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');
var express = require('express');
var app = express();
var md = require("node-markdown").Markdown;
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var JsDiff = require('diff');
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

var diff_to_html = require('./diff-to-html.js');

module.exports = (function(){
    var router = express.Router();

	router.get('/tutorial/:objid', function (req, res){
		var objid = req.param("objid");
		schema.Tutorial.findOne({_id: new ObjectId(objid)}, function(err,tutorial) {
			res.render('tutorial.jade', {tutorial: tutorial, user: req.user, tutorial_html:md(tutorial.content, true)});
		});
	})

    router.get('/tutorial/:objid/changes', function (req, res){
        var objid = req.param("objid");
        schema.Change.find({tutorial: new ObjectId(objid)}).sort({time:-1}).exec(function(err,changes){
            if (changes.length > 20){
                changes = changes.slice(0, 20);
            }
            res.render('changes.jade', {changes:changes, user: req.user});
        });
    })


    router.get('/change/:objid', function (req, res){
        var objid = req.param("objid");
        schema.Change.findOne({_id: new ObjectId(objid)}, function(err,change) {
            var oldContent = md(change.oldContent); 
            var newContent = md(change.newContent);

            var diff = JsDiff.diffLines(change.oldContent, change.newContent);
            var diff_html = diff_to_html.diff_to_html(diff);

            res.render('change.jade', {change: change, user: req.user, diff_html:diff_html});
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
		var newTutorial = new schema.Tutorial({name:name, description:description, content:content, vote_score:0});
    	newTutorial.lastChanged = new Date();
    	user.tutorials.push(newTutorial._id);
    	newTutorial.contributors.push(user._id);
        //creates 1st delta
        var init_change = new schema.Change({});
        init_change.time = new Date();
        init_change.oldContent = "";
        init_change.newContent = content;
        init_change.tutorial = newTutorial._id;
        init_change.creator = user._id;
        //now add change as a reference too
        newTutorial.changes.push(init_change._id);
        user.changes.push(init_change._id);

        init_change.save(function (err) {if (err) console.log ('Error. user cant save')});
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
            var last_change_id = obj.changes[obj.changes.length-1];
        	res.render('edit.jade', {tutorial: obj, user: req.user, last_change_id: last_change_id});
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
    	schema.Tutorial.findOne({_id: new ObjectId(objid)}, function(err,tutorial) {
        	//if the edit didnt do shit
        	if (tutorial.name == name && tutorial.description == description && tutorial.content == content){
            	res.redirect('/tutorial/' + objid);
            	return;
        	}
            var oldContent = tutorial.content;
        	tutorial.name = name;
        	tutorial.description = description;
        	tutorial.content = content;
        	tutorial.lastChanged = new Date();
            //if the user profile isnt linked to the tutorial yet
        	if (tutorial.contributors.indexOf(user._id) == -1){
            	user.tutorials.push(tutorial._id);
            	tutorial.contributors.push(user._id);
        	}

            var newChange = new schema.Change({});
            newChange.time = new Date();
            newChange.oldContent = oldContent;
            newChange.newContent = content;
            newChange.tutorial = tutorial._id;
            newChange.creator = user._id;
            //add references to this change
            tutorial.changes.push(newChange._id);
            user.changes.push(newChange._id);

            newChange.save(function (err) {if (err) console.log ('Error. user cant save')});
            user.save(function (err) {if (err) console.log ('Error. user cant save')});
        	tutorial.save(function (err) {
            	if (err) 
                	console.log ('Error. tutorial cant save')
            	res.redirect('/tutorial/' + objid);
            	return;
        	});
    	});
	})

    return router;
})();

