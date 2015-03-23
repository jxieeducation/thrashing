var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');
var voteHelper = require('./../tutorial/vote.js');
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

    //btw this prob should be post
    //returns 1 if is lastest commit, 0 if not latest
	router.get('/:tutorial_id/:change_id', function (req, res) {
        var tutorial_id = new ObjectId(req.param("tutorial_id"));
        schema.Tutorial.findOne({_id: tutorial_id}, function(err,tutorial) {
            var last_id = tutorial.changes[tutorial.changes.length-1];
            var result = 0; //0 is false, 1 is a match
            if (last_id == req.param("change_id")){
                result = 1;
            }
            res.jsonp({ result: result });
        });    	
	})

    //added v1 so that it doesnt confuse this with /:id/:id
    router.get('/vote/:tutorial_id/v1', function (req, res) {
        var tutorial_id = new ObjectId(req.param("tutorial_id"));
        schema.Tutorial.findOne({_id: tutorial_id}, function(err,tutorial) {
            res.jsonp({ vote_score: tutorial.vote_score });
        });     
    })

    //0 is down vote, 1 is up vote
    router.post('/vote/:tutorial_id/:vote', function (req, res) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var vote = req.param("vote") == '0' ? false : true;
        var tutorial_id = new ObjectId(req.param("tutorial_id"));
        schema.Tutorial.findOne({_id: tutorial_id},function(err, tutorial) {
            var ip_voted_already = false;
            for (var i = 0; i < tutorial.votes.length; i++){
                if (tutorial.votes[i].ip == ip){
                    ip_voted_already = true;
                    //doesnt need to update since user voted already and voted the same thing, so all good
                    if (tutorial.votes[i].vote == vote){
                        res.jsonp({ needToUpdate:false });
                        return;
                    }
                    //user changed their mind
                    tutorial.votes[i].vote = vote;
                }
            }
            //first time voting :P
            if (!ip_voted_already){
                tutorial.votes.push({ip:ip, vote:vote});
            }
            tutorial.vote_score = voteHelper.updateVote(tutorial);
            tutorial.save(function (err) {if (err) console.log ('Error. tutorial cant save')});
            res.jsonp({ needToUpdate:true });
        });
    })

    return router;
})();
