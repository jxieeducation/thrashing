var CronJob = require('cron').CronJob;
var schema = require('./../schema/schema.js');
var fs = require('fs');
var nodemailer = require('nodemailer');

var obj = JSON.parse(fs.readFileSync('private_settings.json', 'utf8'));
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: obj['gmail_user'],
        pass: obj['gmail_pass']
    }
});

function sendUpdateToUser(user, msg){
    var mailOptions = {
        from: obj['gmail_user'],
        to: user.email,
        subject: 'Daily Digest - Thrashing',
        text: msg,
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}


function emailJob(){
    console.log("sending daily emails");
    schema.Feed.findOne({type:"main"}, function(err, feed){
        schema.Tutorial.find({'_id': { $in:feed.tutorials }}).sort({score_main:-1}).exec(function(err, tutorials){
            var msg = "Hey, Thrashing daily digest here.\n\n";
            for(var i = 0; i < tutorials.length; i++){
                var tutorial = tutorials[i];
                msg += obj['server_address'] + "tutorial/" + tutorial._id + "\n";
                msg += tutorial.name + "\n";
                msg += tutorial.description + "\n"; 
                msg += "\n\n";
            }
            schema.User.find({}, function(err, users) {
                for(var i = 0; i < users.length; i++){
                    sendUpdateToUser(users[i], msg);
                }
            });
        });
    });
}

emailJob();
