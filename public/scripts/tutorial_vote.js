function update_vote_score(){
	var tutorial_id = document.getElementById('tutorial-id').innerHTML;
	$.ajax({
		type: "GET",
        url: "/api/tutorial/vote/" + tutorial_id + "/v1",
        success: function(data){
        	document.getElementById('vote-score').innerHTML = data['vote_score'];
    	},
    	error: function (request, status, error) {
    		console.log("Can't update vote_score... lol...");
   		}
    });
}

function vote(up_or_down){
	var tutorial_id = document.getElementById('tutorial-id').innerHTML;
	$.ajax({
		type: "POST",
		data: {},
        url: "/api/tutorial/vote/" + tutorial_id + "/" + up_or_down,
        success: function(data){
        	if(data['needToUpdate'] == true){
        		update_vote_score();
        	}
    	},
    	error: function (request, status, error) {
    		console.log("Can't vote... rip.");
   		}
    });

}

$(document).ready(function() {
	
	$("#up-button").click( function(){
		vote("1");
	});

	$("#down-button").click( function(){
		vote("0");
	});
	
});
