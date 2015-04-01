db.tutorials.find().forEach( function(tutorial){
	tutorial.visitors = [];
	tutorial.created = new Date();
	db.tutorials.save(tutorial);
})