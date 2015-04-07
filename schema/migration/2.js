db.tutorials.find().forEach( function(tutorial){
	tutorial.uri = encodeURIComponent(tutorial.name.split(" ").join("-")).toLowerCase() + "-" + tutorial._id.valueOf();
	tutorial.score_main = 0;
	tutorial.score_overall = 0;
	db.tutorials.save(tutorial);
})
