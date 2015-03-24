var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./schema/schema.js');
var express = require('express');
var app = express();
var md = require("node-markdown").Markdown;
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

app.get('/', function (req, res) {
    if (req.user){
        res.redirect('/feed');
        return;
    }
	res.render('index.jade', {'user': req.user});
})

app.get('/about', function (req, res) {
    res.render('about.jade', {'user': req.user});
})

app.get('/feed', function (req, res){
    schema.Tutorial.find().sort({lastChanged:-1}).exec(function(err,tutorials){
        if (tutorials.length > 20){
            tutorials = tutorials.slice(0, 20);
        }
        res.render('feed.jade', {tutorials: tutorials, user: req.user});
    });
})

var server = app.listen(3000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('listening at http://%s:%s', host, port)
})
