var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');
var express = require('express');
var app = express();
var md = require("node-markdown").Markdown;
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var JsDiff = require('diff');
var rendering_helpers = require('../api/rendering_helpers.js');
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

var diff_to_html = require('./diff-to-html.js');
module.exports = (function(){
    var router = express.Router();

	router.get('/tutorial/:objid', function (req, res){
		var objid = req.param("objid");
        var tutorial_id = new ObjectId(objid);
        res.locals.dateFormater = rendering_helpers.dateFormater;
		schema.Tutorial.findOne({_id: tutorial_id}, function(err,tutorial) {
            if(!tutorial){
                res.status(404).send('Not found');
                return;
            }
            schema.Change.find({tutorial: tutorial_id, status: schema.change_status['open']}, function(err,objs) {
                res.render('tutorial.jade', {tutorial: tutorial, user: req.user, tutorial_html:md(tutorial.content, true), num_open_changes: objs.length});
            });
		});
	})

    router.get('/tutorial/:objid/changes', function (req, res){
        var objid = req.param("objid");
        res.locals.dateFormater = rendering_helpers.dateFormater;
        schema.Change.find({tutorial: new ObjectId(objid)}).sort({time:-1}).exec(function(err,changes){
            if(!changes){
                res.status(404).send('Not found');
                return;
            }
            var closed_applied_changes = [];
            var closed_unapplied_changes = [];
            var open_changes = [];
            for (var i = 0; i < changes.length; i++){
                var change = changes[i];
                if (change.status == schema.change_status['closed_applied']){
                    closed_applied_changes.push(change);
                }else if (change.status == schema.change_status['closed_not_applied']){
                    closed_unapplied_changes.push(change);
                }else{
                    open_changes.push(change);
                }
            }
            res.render('changes.jade', {user: req.user, closed_applied_changes:closed_applied_changes, closed_unapplied_changes:closed_unapplied_changes, open_changes:open_changes});
        });
    })

    router.get('/change/:objid', function (req, res){
        var objid = req.param("objid");
        res.locals.dateFormater = rendering_helpers.dateFormater;
        schema.Change.findOne({_id: new ObjectId(objid)}, function(err,change) {
            if(!change){
                res.status(404).send('Not found');
                return;
            }
            schema.Tutorial.findOne({_id: new ObjectId(change.tutorial)}, function(err,tutorial) {
                var isOwner = false;
                if (req.user && (tutorial.owner.toString() == req.user._id.toString()) && (change.status == schema.change_status['open'])){
                    isOwner = true;
                }
                var oldContent = md(change.oldContent); 
                var newContent = md(change.newContent);

                var diff = JsDiff.diffLines(change.oldContent, change.newContent);
                var diff_html = diff_to_html.diff_to_html(diff);

                res.render('change.jade', {change: change, user: req.user, diff_html:diff_html, status: schema.change_status_meaning[change.status], isOwner: isOwner});
            });
        });
    })

    router.post('/change/:objid/:decision', function (req, res){
        var decision = req.param("decision") == "0" ? false : true;
        var objid = req.param("objid");
        schema.Change.findOne({_id: new ObjectId(objid)}, function(err,change) {
            if(!change){
                res.status(404).send('Not found');
                return;
            }
            schema.Tutorial.findOne({_id: new ObjectId(change.tutorial)}, function(err,tutorial) {
                //not owner
                if(req.user._id.toString() != tutorial.owner.toString()){
                    res.redirect("/tutorial/" + change.tutorial);
                }
                //if change rejected
                if (!decision){
                    change.status = schema.change_status['closed_not_applied'];
                    change.save(function (err) {if (err) console.log ('Error. change cant save')});
                    res.redirect("/tutorial/" + change.tutorial);
                }else{
                //accepted
                    //if the version matched, so change can be applied directly
                    if(change.oldContent == tutorial.content){
                        change.status = schema.change_status['closed_applied'];
                        tutorial.changes.push(change._id);
                        tutorial.lastChanged = new Date();
                        tutorial.content = change.newContent;
                        tutorial.save(function (err) {if (err) console.log ('Error. tutorial cant save')});
                        change.save(function (err) {if (err) console.log ('Error. change cant save')});
                        res.redirect("/tutorial/" + change.tutorial);
                    }else{
                    //here we hv a version conflict and need the owner to manually edit it
                        var last_change_id = tutorial.changes[tutorial.changes.length-1];
                        res.render('merge_conflict.jade', {'user': req.user, 'tutorial':tutorial, 'change':change, 'last_change_id':last_change_id});
                    }
                }
            });
        });
    })

    router.post('/merge/:objid', function (req, res){
        if (!req.user){
            res.redirect('/signin');
            return;
        }
        var user = req.user;
        var content = req.body.content;
        var objid = req.param("objid");
        schema.Change.findOne({_id: new ObjectId(objid)}, function(err,change) {
            if(!change){
                res.status(404).send('Not found');
                return;
            }
            schema.Tutorial.findOne({_id: new ObjectId(change.tutorial)}, function(err,tutorial) {
                //not owner
                if(req.user._id.toString() != tutorial.owner.toString()){
                    res.redirect("/tutorial/" + change.tutorial);
                }
                change.newContent = content;
                change.status = schema.change_status['closed_applied'];
                tutorial.content = content;
                tutorial.lastChanged = new Date();
                tutorial.changes.push(change._id);
                tutorial.save(function (err) {if (err) console.log ('Error. tutorial cant save')});
                change.save(function (err) {if (err) console.log ('Error. change cant save')});
                res.redirect("/tutorial/" + change.tutorial);
            });
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
    	user.contributed_tutorials.push(newTutorial._id);
    	newTutorial.contributors.push(user._id);
        newTutorial.owner = user._id;
        //creates 1st delta
        var init_change = new schema.Change({});
        init_change.status = schema.change_status['closed_applied'];
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
            if(!obj){
                res.status(404).send('Not found');
                return;
            }
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
            if(!tutorial){
                res.status(404).send('Not found');
                return;
            }
        	//if the edit didnt do shit
        	if (tutorial.name == name && tutorial.description == description && tutorial.content == content){
            	res.redirect('/tutorial/' + objid);
            	return;
        	}
            var oldContent = tutorial.content;
            if (tutorial.owner.toString() == user._id.toString()){
                tutorial.name = name;
                tutorial.description = description;
                tutorial.content = content;
                tutorial.lastChanged = new Date();
            }
            //if the user profile isnt linked to the tutorial yet
        	if (tutorial.contributors.indexOf(user._id) == -1){
            	user.contributed_tutorials.push(tutorial._id);
            	tutorial.contributors.push(user._id);
        	}

            var newChange = new schema.Change({});
            if (tutorial.owner.toString() == user._id.toString()){
                newChange.status = schema.change_status['closed_applied'];
            }else{
                newChange.status = schema.change_status['open'];
            }
            newChange.time = new Date();
            newChange.oldContent = oldContent;
            newChange.newContent = content;
            newChange.tutorial = tutorial._id;
            newChange.creator = user._id;
            //add references to this change
            if (tutorial.owner.toString() == user._id.toString()){
                tutorial.changes.push(newChange._id);
            }
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

