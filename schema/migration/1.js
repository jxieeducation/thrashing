db.tutorials.find().forEach( function(tutorial){
	tutorial.visitors = [];
	db.tutorials.save(tutorial);
})
