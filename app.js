var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./schema.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

var LocalStrategy = require('passport-local').Strategy;
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

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

app.get('/signin', function (req, res) {
	res.render('signin.jade', {});
})


var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    User.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                req.flash('message', 'User Not found.'));                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return done(null, false, 
              req.flash('message', 'Invalid Password'));
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        return done(null, user);
      }
    );
}));

app.post('/signin', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash : true 
}));

passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = password;
          newUser.email = req.param('email');
          newUser.firstName = req.param('firstName');
          newUser.lastName = req.param('lastName');
          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
}));

//http://code.tutsplus.com/tutorials/authenticating-nodejs-applications-with-passport--cms-21619




var server = app.listen(3000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('listening at http://%s:%s', host, port)
})
