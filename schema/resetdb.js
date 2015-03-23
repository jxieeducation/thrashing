//script to reset the db

var schema = require('./schema.js');

function clean(){
    schema.Tutorial.remove(function (err) {
        if (err) {
            console.log(err);
        }
    });
    schema.Change.remove(function (err) {
        if (err) {
            console.log(err);
        }
    });
    schema.User.remove(function (err) {
        if (err) {
            console.log(err);
        }
    });
}

clean();

//clean elastic search index stuff
var exec = require('child_process').exec;
exec('curl -XDELETE localhost:9200/tutorials', function (error, stdout, stderr) {
    if(error){
        console.log(error); 
    }
});
