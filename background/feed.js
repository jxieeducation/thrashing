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

score = vote_score * (0.99) ^ T1 + 15 * max(0, (36 - T2) / 36)
-> first part is a decay function, note 0.99 ^ 24 is about 75%
-> second part is to boost new posts, with automatic 15 points that decays over 36 hrs
*/
function updateFeed(){
    console.log("re-calculating top tutorials");
    schema.Tutorial.find({}, function(err, tutorials){
        //the first part generate the generic feed
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
        console.log(tutorial_list);
        schema.Feed.findOne({type: "main"}, function(err, feed){
            feed.tutorials = [];
            for (var i = 0; i < tutorial_list.length; i++){
                feed.tutorials.push(tutorial_list[i]['key']);
            }
            feed.save(function (err) {if (err) console.log ('Error. feed cant save')});
        });
    });
}

new CronJob('*/15 * * * *', function(){
    updateFeed();
}, null, true, "America/Los_Angeles"); 
