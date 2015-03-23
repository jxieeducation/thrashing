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

module.exports = {
	updateVote: updateVote,
};