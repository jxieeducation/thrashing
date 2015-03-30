var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var util = require('util');
app.use(bodyParser.urlencoded());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

function EStoTutorials(result){
    if (result.total == 0){
        return [];
    }
    //{_id, name, description}
    var displays = [];
    for (var i = 0; i < result.hits.length; i++){
        var hit = result.hits[i];
        displays.push({_id:hit._source._id, name: hit._source.name, description: hit._source.description});
    }
    return displays;
}


module.exports = (function(){
    var router = express.Router();
    try{
        router.post('/search', function (req, res) {
            var query = req.body.query;
            schema.Tutorial.search({ query: query, fuzziness: 0.5 }, function (err, results) {
                if(err) console.log(err);

                res.render('search.jade', {user: req.user, results:EStoTutorials(results)});
            })
        });
    } catch(err){
        res.render('search.jade', {user: req.user});
    }
    return router;
})();

