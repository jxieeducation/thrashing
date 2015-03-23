/*
TO LIST ALL ELASTIC SEARCH INDEX:
curl http://localhost:9200/_aliases?pretty=1

TO DEL ELASTIC SEARCH INDEX:
curl -XDELETE localhost:9200/tutorials-2015-03-23t22:05:12.170z
*/
var CronJob = require('cron').CronJob;
var schema = require('./schema.js');
var exec = require('child_process').exec;

function ESUpdate(){
	console.log("starting");
	schema.Tutorial.sync(function (err, numSynced) {
		if(err){
			console.log(err);
		}else{
			console.log('number of tutorials synced:', numSynced);
		}
	});
}

//elastic search will update every 1 min
new CronJob('* * * * *', function(){
	ESUpdate();
}, null, true, "America/Los_Angeles");
