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

function formatComments(comments, subcomments){
    var result = [];
    for (var i = 0; i < comments.length; i++){
        var comment = comments[i];
        var wrap = {vote_score:comment.vote_score, content: comment.content, time:comment.time, _id:comment._id};
        var subcomment_wrap = [];
        for (var j = 0; j < subcomments.length; j++){
            var subcomment = subcomments[j];
            if (subcomment.comment.toString() == comment._id.toString()){
                subcomment_wrap.push({ content:subcomment.content, time:subcomment.time, _id:subcomment._id });
            }
        }
        wrap.subcomments = subcomment_wrap;
        result.push(wrap);
    }
    return result;
}

module.exports = (function(){
    var router = express.Router();

    //create a new comment
    router.post('/new/:tutorial_id/:user_id', function (req, res) {
        var user_id = req.param("user_id");
        var tutorial_id = req.param("tutorial_id");
        var content = req.body.content;
        var comment = new schema.Comment({ content:content, vote_score:0, time: new Date()});
        comment.tutorial = tutorial_id;
        comment.user = user_id;
        comment.save(function (err) {
            if (err){
                res.jsonp({ success: false });
            }else{
                var response = [{ vote_score:0, content:content, time:comment.time, votes:[], subcomments:[], _id:comment._id }];
                res.jsonp({ success: true, response:response });
            }
        });
    })

    //create a new subcomment
    router.post('/new/:tutorial_id/:user_id/:comment_id', function (req, res) {
        var user_id = req.param("user_id");
        var tutorial_id = req.param("tutorial_id");
        var comment_id = req.param("comment_id");
        var content = req.body.content;
        var subcomment = new schema.Subcomment({ content:content, time: new Date()});
        subcomment.comment = comment_id;
        subcomment.user = user_id;
        subcomment.save(function (err) {if (err) console.log("failed subcomment save")});
        schema.Comment.findOne({_id: new ObjectId(comment_id)}, function(err, comment) {
            comment.subcomments.push(subcomment._id);
            comment.save(function(err){
                if (err){
                    res.jsonp({ success: false });
                }else{
                    var response = [{ content:content, time:comment.time }];
                    res.jsonp({ success: true, response:response });
                }
            });
        });
    })

    //get a summarized list of comments to display
    router.get('/display/:tutorial_id/', function (req, res) {
        var tutorial_id = req.param("tutorial_id");
        //sort via score 1st, then chronological
        schema.Comment.find({tutorial: new ObjectId(tutorial_id)}).sort({ vote_score: -1, time: +1 }).exec(function(err,comments){
            //make a list of all the subcomments
            var subcomments_list = [];
            for (var i = 0; i < comments.length; i ++){
                subcomments_list = subcomments_list.concat(comments[i].subcomments);
            }
            schema.Subcomment.find({'_id': { $in: subcomments_list}}).sort({ time: +1 }).exec(function(err, subcomments){
                //we needed to do a batch read because mongoose is super annoying and doesnt allow sync. searches, and nested stuff is hard :(
                res.jsonp({ response: formatComments(comments, subcomments) });
            });
        });
    })

    router.post('/vote/:comment_id/:vote', function (req, res) {
        var comment_id = req.param("comment_id");
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var vote = req.param("vote") == '0' ? false : true;
        schema.Comment.findOne({_id: new ObjectId(comment_id)},function(err, comment){
            var ip_voted_already = false;
            for (var i = 0; i < comment.votes.length; i++){
                if (comment.votes[i].ip == ip){
                    ip_voted_already = true;
                    //doesnt need to update since user voted already and voted the same thing, so all good
                    if (comment.votes[i].vote == vote){
                        res.jsonp({ needToUpdate:false });
                        return;
                    }
                    //user changed their mind
                    comment.votes[i].vote = vote;
                }
            }
            //first time voting :P
            if (!ip_voted_already){
                comment.votes.push({ip:ip, vote:vote});
            }
            comment.vote_score = voteHelper.updateVote(comment);
            comment.save(function (err) {if (err) console.log ('Error. tutorial cant save')});
            res.jsonp({ needToUpdate:true, score: comment.vote_score });
        });
    })

    return router;
})();
