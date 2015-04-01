db.tutorials.find().forEach( function(tutorial){
	tutorial.visitors = [];
	tutorial.created = new Date();
	tutorial.related_tutorials = [];
	db.tutorials.save(tutorial);
})

db.feeds.insert({ type: "main", tutorials: []})

