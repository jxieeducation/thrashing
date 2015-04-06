var schema = require('./../schema/schema.js');

function generateRelated(){
    console.log("calculating related tutorials");
	schema.Tutorial.find({}, function(err, tutorials){
		for (var i = 0; i < tutorials.length; i++){
			var tutorial = tutorials[i];
			schema.Tutorial.search({ query: tutorial.content, fuzziness: 0.5 }, function (err, results) {
    			if(err){
        			console.log("ERRR");
        			return;
    			}
    			tutorial.related_tutorials = [];
    			for (var i = 0; i < results['hits'].length; i++){
                    if(results['hits'][i]['_id'].toString() != tutorial._id.toString()){
                        tutorial.related_tutorials.push(results['hits'][i]['_id']);
                        if(tutorial.related_tutorials.length > 6){
                            break;
                        }
                    }
    			}
    			tutorial.save(function (err) {if (err) console.log ('Error. tutorial cant save')});
			})
		}
		console.log("related tutorials done");
	});
}

generateRelated();
