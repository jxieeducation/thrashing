var schema = require('./../schema/schema.js');

schema.Tutorial.search({ query: "", fuzziness: 0.5 }, function (err, results) {
    if(err){
        console.log("ERRR");
        return;
    }
    console.log(results['hits'][0]['_id']);
})
