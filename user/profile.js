var express = require('express');
var app = express();
var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());

module.exports = (function(){
    var router = express.Router();

    router.get('/profile', function (req, res) {
        if (!req.user){
            res.redirect('/signin');
            return;
        }
        var context = {};
        var user = req.user;
        context['user'] = user;
        schema.Tutorial.find({'_id': { $in:user.tutorials }}, function(err, tutorials){
            context['num_contributions'] = user.changes.length;
            context['num_tutorials'] = user.tutorials.length;
            context['tutorials'] = tutorials;
            res.render('profile.jade', context);
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
        res.redirect('/profile');
    })

    return router;
})();
