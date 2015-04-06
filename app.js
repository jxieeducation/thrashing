var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./schema/schema.js');
var express = require('express');
var app = express();
var md = require("node-markdown").Markdown;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/public/images/favicon.ico'));

var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
app.use(expressSession({secret: 'bobiscool'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var auth = require('./user/auth.js');
app.use('/', auth);
var profile = require('./user/profile.js');
app.use('/', profile);
var tutorial = require('./tutorial/tutorial_express.js');
app.use('/', tutorial);
var search = require('./tutorial/tutorial_search.js');
app.use('/', search);
var tutorial_api = require('./api/update_tutorial.js');
app.use('/api/tutorial/', tutorial_api);
var comment_api = require('./api/update_comment.js');
app.use('/api/comment/', comment_api);
var profile_api = require('./api/update_profile.js');
app.use('/api/profile/', profile_api);

schema.Tutorial.sync(function (err, numSynced) {
    if(err){
        console.log(err);
    }else{
        console.log('number of tutorials synced:', numSynced);
    }
});

app.get('*', function(req, res, next) {
  if (req.headers.host.slice(0, 3) != 'www') {
    res.redirect('http://www.' + req.headers.host + req.url, 301);
  } else {
    next();
  }
});

app.get('/', function (req, res) {
    if (req.user){
        res.redirect('/feed');
        return;
    }
    schema.Feed.findOne({type:"main"}, function(err, feed){
        schema.Tutorial.find({'_id': { $in:feed.tutorials }}, function(err, main_tutorials){
            schema.Feed.findOne({type:"overall"}, function(err, feed){
                schema.Tutorial.find({'_id': { $in:feed.tutorials }}, function(err, overall_tutorials){
                    res.render('index.jade', {main_tutorials: main_tutorials, overall_tutorials:overall_tutorials, user: req.user});
                });
            });
        });
    });
})

app.get('/about', function (req, res) {
    res.render('about.jade', {'user': req.user});
})

app.get('/feed', function (req, res){
    schema.Feed.findOne({type:"main"}, function(err, feed){
        schema.Tutorial.find({'_id': { $in:feed.tutorials }}, function(err,tutorials){
            for (var i = 0; i < tutorials.length; i++){
                var tutorial = tutorials[i];
                tutorial.html_content = md(tutorial.content, true);
            }
            res.render('feed.jade', {tutorials: tutorials, user: req.user});
        });
    });
})

app.get('/archive', function (req, res){
    schema.Tutorial.find().sort({lastChanged:-1}).exec(function(err,tutorials){
        res.render('feed.jade', {tutorials: tutorials, user: req.user});
    });
})

var server = app.listen(80, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('listening at http://%s:%s', host, port)
})
