var express = require('express');
var app = express();
var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var rendering_helpers = require('../api/rendering_helpers.js');
app.use(bodyParser.urlencoded());

module.exports = (function(){
    var router = express.Router();

    router.get('/profile/:user_id', function (req, res) {
        var context = {};
        var user_id = req.param("user_id");
        res.locals.linkNoHTTPFixer = rendering_helpers.linkNoHTTPFixer;
        schema.User.findOne({_id: user_id}, function(err, user) {
            if(!user){
                res.status(404).send('Not found');
                return;
            }
            context['user_profile'] = user;
            context['user'] = (req.user)? req.user : null;
            context['can_edit_profile_info'] = (req.user && req.user._id.toString() == user._id.toString())? true : false;
            schema.Tutorial.find({'_id': { $in:user.contributed_tutorials }}).sort({vote_score:-1}).exec(function(err,tutorials){
                context['num_contributions'] = user.changes.length;
                context['num_tutorials'] = user.contributed_tutorials.length;
                if(tutorials.length > 3){
                    tutorials = tutorials.slice(0, 3);
                }
                context['tutorials'] = tutorials;
                res.render('profile.jade', context);
            });
        });
    })

    router.get('/profile_tutorials/:user_id', function (req, res) {
        var context = {};
        var user_id = req.param("user_id");
        res.locals.linkNoHTTPFixer = rendering_helpers.linkNoHTTPFixer;
        schema.User.findOne({_id: user_id}, function(err, user) {
            if(!user){
                res.status(404).send('Not found');
                return;
            }
            schema.Tutorial.find({'_id': { $in:user.contributed_tutorials }}).sort({last_changed: 1}).exec(function(err,sorted_tutorials){
                context['user_profile'] = user;
                context['tutorials'] = sorted_tutorials;
                res.render('profile_tutorials.jade', context);
            });
        });
    })

    router.get('/edit_profile', function (req, res) {
        if (!req.user){
            res.redirect('/signin');
            return;
        }
        res.render('edit_profile.jade', {user: req.user});
    })

    router.post('/edit_profile', function (req, res) {
        if (!req.user){
            res.redirect('/signin');
            return;
        }
        var user = req.user;
        var name = req.body.name;
        var company = req.body.company;
        var site = req.body.site;
        user.name = name;
        user.company = company;
        user.site = site;
        user.save(function (err) {if (err) console.log ('Error. user cant save')});
        res.redirect('/profile/' + user._id);
    })

    return router;
})();
