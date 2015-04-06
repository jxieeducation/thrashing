/*
START ES:
~/bin/elasticsearch/bin/elasticsearch

SHUT DOWN ES:
curl -XPOST 0.0.0.0:9200/_shutdown

TO LIST ALL ELASTIC SEARCH INDEX:
curl http://localhost:9200/_aliases?pretty=1

TO DEL ELASTIC SEARCH INDEX:
curl -XDELETE localhost:9200/tutorials*
*/
var CronJob = require('cron').CronJob;
var schema = require('./../schema/schema.js');
var exec = require('child_process').exec;

function ESUpdate(){
    console.log("restarting ES");
	exec('curl -XPOST 0.0.0.0:9200/_shutdown', function (error, stdout, stderr) {
    	if(error){
        	console.log(error); 
            return;
    	}
        setTimeout(function(){
            exec('~/bin/elasticsearch/bin/elasticsearch', function (error, stdout, stderr) {
                if(error){
                    console.log(error); 
                    return;
                }
                console.log("restarted ES");
            });
        }, 5000);
	});
}

ESUpdate();