function updateVote(tutorial){
	var count = 0;
	for (var i = 0; i < tutorial.votes.length; i++){
		if(tutorial.votes[i].vote == true){
			count += 1;
		}
		else{
			count -= 1;
		}
	}
	return count;
}

function visitorInfo(req){
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var time = new Date();
	var referer = "direct";
	if (req.headers.hasOwnProperty("referer")){
		referer = req.headers['referer'];
	}
	return {ip: ip, time: time, referer: referer};
}

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) { return b.value - a.value; });
    return arr;
}

module.exports = {
	updateVote: updateVote,
	visitorInfo: visitorInfo,
	sortObject: sortObject,
};