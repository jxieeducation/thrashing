var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');
var express = require('express');
var app = express();
var md = require("node-markdown").Markdown;
var bodyParser = require('body-parser');
var flash = require('connect-flash');
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

module.exports = (function(){
    var router = express.Router();

    //btw this prob should be post
    //returns 1 if is lastest commit, 0 if not latest
	router.get('/:tutorial_id/:change_id', function (req, res) {
        var tutorial_id = new ObjectId(req.param("tutorial_id"));
        schema.Tutorial.findOne({_id: tutorial_id}, function(err,tutorial) {
            var last_id = tutorial.changes[tutorial.changes.length-1];
            var result = 0; //0 is false, 1 is a match
            if (last_id == req.param("change_id")){
                result = 1;
            }
            res.jsonp({ result: result });
        });    	
	})

    return router;
})();

