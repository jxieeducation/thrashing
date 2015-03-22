var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./schema.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
app.use(expressSession({secret: 'bobiscool'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var auth = require('./auth.js');
app.use('/', auth);

app.get('/', function (req, res) {
    if (req.user){
        res.redirect('/feed');
    }
	res.render('index.jade', {'user': req.user});
})

app.get('/new', function (req, res) {
    if (!req.user){
        res.redirect('/signin');
    }
	res.render('new.jade', {'user': req.user});
})

app.post('/new', function (req, res) {
    if (!req.user){
        res.redirect('/signin');
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
    });
})

app.get('/feed', function (req, res){
    schema.Tutorial.find({}, function(err, tutorials) {
        if (tutorials.length == 0){
            res.redirect('/profile');
            return;
        }
        schema.Tutorial.find().sort({lastChanged:-1}).exec(function(err,tutorials){
            if (tutorials.length > 20){
                tutorials = tutorials.slice(0, 20);
            }
            res.render('feed.jade', {tutorials: tutorials, user: req.user});
        });
    });
})

app.get('/profile', function (req, res) {
    if (!req.user){
        res.redirect('/signin');
    }
    var context = {};
    context['user'] = req.user;
    schema.Tutorial.find({'_id': { $in:req.user.tutorials }}, function(err, tutorials){
        context['tutorials'] = tutorials;
        res.render('profile.jade', context);
    });
})

app.get('/tutorial/:objid', function (req, res){
	var objid = req.param("objid");
	schema.Tutorial.findOne({_id: new ObjectId(objid)}, function(err,obj) {
		res.render('tutorial.jade', {tutorial: obj, user: req.user});
	});
})

app.get('/edit/:objid', function (req, res){
    if (!req.user){
        res.redirect('/signin');
    }
    var objid = req.param("objid");
    schema.Tutorial.findOne({_id: new ObjectId(objid)}, function(err,obj) {
        res.render('edit.jade', {tutorial: obj, user: req.user});
    });
})

app.post('/edit/:objid', function (req, res){
    if (!req.user){
        res.redirect('/signin');
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
        });        
    });
})

var server = app.listen(3000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('listening at http://%s:%s', host, port)
})
