/*
TO LIST ALL ELASTIC SEARCH INDEX:
curl http://localhost:9200/_aliases?pretty=1

TO DEL ELASTIC SEARCH INDEX:
curl -XDELETE localhost:9200/tutorials*
*/
var CronJob = require('cron').CronJob;
var schema = require('./../schema/schema.js');
var exec = require('child_process').exec;

function ESUpdate(){
	console.log("starting");
	var exec = require('child_process').exec;
	exec('curl -XDELETE localhost:9200/tutorials*', function (error, stdout, stderr) {
    	if(error){
        	console.log(error); 
   		}
	});
	schema.Tutorial.sync(function (err, numSynced) {
		if(err){
			console.log(err);
		}else{
			console.log('number of tutorials synced:', numSynced);
		}
	});
}

//elastic search will update every 1 min
new CronJob('*/5 * * * *', function(){
	ESUpdate();
}, null, true, "America/Los_Angeles");
