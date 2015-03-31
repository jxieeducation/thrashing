var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');
var express = require('express');
var app = express();
var md = require("node-markdown").Markdown;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

module.exports = (function(){
    var router = express.Router();

    //551500b0df6f8bd30964e66c/1412146800/1427785200
    //get heatmap data
    router.get('/calendar/:user_id/:start/:end', function (req, res) {
        var user_id = req.param("user_id");
        var start = req.param("start");
        var end = req.param("end");
        schema.Change.find({creator: new ObjectId(user_id)}, function(err, changes) {
            var mapping = {};
            for (var i = 0; i < changes.length; i++){
                var change = changes[i];
                var stamp = Math.floor(change.time.getTime() / 1000);
                if(mapping.hasOwnProperty(stamp)){
                    mapping[stamp] += 1;
                }else{
                    mapping[stamp] = 1;
                }
            }
            res.json(mapping);
        });
    })

    return router;
})();
