db.tutorials.find().forEach( function(tutorial){
	tutorial.uri = encodeURIComponent(tutorial.name.split(" ").join("-")).toLowerCase();
	tutorial.visitors = [];
	tutorial.created = new Date();
	tutorial.related_tutorials = [];
	db.tutorials.save(tutorial);
})

db.feeds.insert({ type: "main", tutorials: []})
db.feeds.insert({ type: "overall", tutorials: []})

