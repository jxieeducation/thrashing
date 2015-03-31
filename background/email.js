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

function sendUpdateToUser(user, tutorials){
    var msg = "Hello " + user.name + ",\n\n\tHere are the tutorials that are updated in the past 24 hrs.\n\n"
    for(var i = 0; i < tutorials.length; i++){
        var tutorial = tutorials[i];
        msg += tutorial.name + "(" + obj['server_address'] + "tutorial/" + tutorial._id + "): ";
        msg += obj['server_address'] + "tutorial/" + tutorial._id + "/changes"; 
        msg += "\n\n";
    }
    var mailOptions = {
        from: obj['gmail_user'],
        to: user.email,
        subject: 'New updates to tutorials - Thrashing',
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

//daily email - if a tutorial that u follow was changed by someone who is not you, you get an email
function userEmail(user){
    var changed_tutorials = []
    schema.Tutorial.find({'_id': { $in:user.contributed_tutorials }}, function(err, tutorials){
        for (var i = 0; i < tutorials.length; i++){
            var tutorial = tutorials[i];
            //if the tutorial is changed in the past 24 hrs
            if ((((new Date).getTime() - tutorial.lastChanged.getTime()) - 24 * 60 * 60 * 1000) < 0){
                changed_tutorials.push(tutorial);
            }
        }
        if (changed_tutorials.length != 0){
            sendUpdateToUser(user, changed_tutorials);
        }
    });
}

function emailJob(){
    schema.User.find({}, function(err, users) {
        for(var i = 0; i < users.length; i++){
            userEmail(users[i]);
        }
    });
}

//5am seems to be a good time to send ppl update emails
new CronJob('0 5 * * *', function(){
    emailJob();
}, null, true, "America/Los_Angeles");