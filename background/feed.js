var CronJob = require('cron').CronJob;
var schema = require('./../schema/schema.js');
var voteHelper = require('./../tutorial/vote.js');

/*
current algo in a nutshell:
- want good tutorials to show up
- also want new tutorials to show up
- tutorials with bad votes will not show up

variables:
- T1 - time since last updated in hrs
- T2 - time since created in hrs
- vote_score

@main feed - fb newsfeed
score = vote_score * (0.99) ^ T1 + 15 * max(0, (36 - T2) / 36)

@overall feed - best tutorials made in the past week
score = vote_score * ((t2 > 24 * 7) ? 0 : 1)

*/
function updateFeed(){
    console.log("re-calculating top tutorials");
    schema.Tutorial.find({}, function(err, tutorials){
        //@main
        var tutorial_list = {};
        for (var i = 0; i < tutorials.length; i++){
            var tutorial = tutorials[i];
            var t1 = Math.abs(new Date() - tutorial.lastChanged) / 36e5;
            var t2 = Math.abs(new Date() - tutorial.created) / 36e5;
            var vote_score = tutorial.vote_score;
            var score = vote_score * Math.pow(0.99, t1) + 15 * Math.max(0, (36 - t2) / 36);
            tutorial_list[tutorial._id] = score;
        }
        tutorial_list = voteHelper.sortObject(tutorial_list);
        if(tutorial_list.length > 10){
            tutorial_list = tutorial_list.slice(0, 10);
        }
        schema.Feed.findOne({type: "main"}, function(err, feed){
            feed.tutorials = [];
            for (var i = 0; i < tutorial_list.length; i++){
                feed.tutorials.push(tutorial_list[i]['key']);
            }
            feed.save(function (err) {if (err) console.log ('Error. feed cant save')});
        });
        //@overall
        tutorial_list = {};
        for (var i = 0; i < tutorials.length; i++){
            var tutorial = tutorials[i];
            var t2 = Math.abs(new Date() - tutorial.created) / 36e5;
            var vote_score = tutorial.vote_score;
            var score = vote_score * ((t2 <= 24 * 7) ? 1 : 0);
            tutorial_list[tutorial._id] = score;
        }
        tutorial_list = voteHelper.sortObject(tutorial_list);
        if(tutorial_list.length > 10){
            tutorial_list = tutorial_list.slice(0, 10);
        }
        schema.Feed.findOne({type: "overall"}, function(err, feed){
            feed.tutorials = [];
            for (var i = 0; i < tutorial_list.length; i++){
                feed.tutorials.push(tutorial_list[i]['key']);
            }
            feed.save(function (err) {if (err) console.log ('Error. feed cant save')});
        });
    });
}

updateFeed();
