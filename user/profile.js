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
        context['user'] = req.user;
        schema.Tutorial.find({'_id': { $in:req.user.tutorials }}, function(err, tutorials){
            context['tutorials'] = tutorials;
            res.render('profile.jade', context);
        });
    })

    return router;
})();
