function get_comments(){
	var tutorial_id = document.getElementById('tutorial-id').innerHTML;
	$.ajax({
		type: "GET",
        url: "/api/comment/display/" + tutorial_id,
        success: function(data){
        	var response = data['response'];
        	can_post_comment_check();
        	populate_comments(response);
        	window.scrollTo(0, 0); //normally it overflows and the window gets scrolled down
    	},
    	error: function (request, status, error) {
    		console.log("Can't display comments. You are doomed");
   		}
    });
}

function can_post_comment_check(){
	var user_p = document.getElementById('user-id');
	//if user isn't logged in, then disable all commenting :P
	if (!user_p){
		var to_delete = ['_new_comment', '_new_subcomment'];
		for (var j = 0; j < to_delete.length; j++){
			var term = to_delete[j];
			var divs = document.getElementsByClassName(term);
			for (var i = 0; i < divs.length; i++){
				var div = divs[i];
				div.remove();
			}
		}
	}
}

function populate_comments(comment_data){
	var user_p = document.getElementById('user-id');
	for (var i = 0; i < comment_data.length; i++){
		var comment = comment_data[i];
		//grab our default template
		var new_div = document.getElementsByClassName('_comment-section')[0].cloneNode(true);
		new_div.id = comment._id;
		new_div.style.display='block'; //make it visible
		new_div.getElementsByClassName('_comment-vote')[0].innerHTML = comment.vote_score;
		new_div.getElementsByClassName('_comment-content')[0].innerHTML = comment.content;
		new_div.getElementsByClassName('_comment-time')[0].innerHTML = comment.time;
		if (user_p){
			new_div.getElementsByClassName('new_subcommment_id')[0].value = comment._id;
		}
		for (var j = 0; j < comment.subcomments.length; j++){
			var subcomment = comment.subcomments[j];
			var new_subcomment_div = new_div.getElementsByClassName('_subcomment-section')[0].cloneNode(true);
			new_subcomment_div.style.display='block';
			new_subcomment_div.getElementsByClassName('_subcomment-content')[0].innerHTML = subcomment.content;
			new_subcomment_div.getElementsByClassName('_subcomment-time')[0].innerHTML = subcomment.time;
			new_div.getElementsByClassName('_subcomment-box')[0].appendChild(new_subcomment_div);
		}
		document.getElementById('_comment-box').appendChild(new_div);
	}
}

function submit_comment(){
	var tutorial_id = document.getElementById('tutorial-id').innerHTML;
	var user_id = document.getElementById('user-id').innerHTML;
	var content = document.getElementById('new_commment_content').value;
	$.ajax({
		type: "POST",
        url: "/api/comment/new/" + tutorial_id + "/" + user_id,
        data: {content: content},
        success: function(data){
        	if(data['success']){
        		populate_comments(data['response']);
        		//reset the comment box value :P
        		document.getElementById('new_commment_content').value = "";
        	}else{
        		alert("comments are broken. ur doomed. gg.");
        	}
    	},
    	error: function (request, status, error) {
    		console.log("Can't add comments. rip.");
   		}
    });
}

function submit_subcomment(f){
	var tutorial_id = document.getElementById('tutorial-id').innerHTML;
	var user_id = document.getElementById('user-id').innerHTML;
	var comment_id = f.comment_id.value;
	var content = f.subcomment_content.value;
	$.ajax({
		type: "POST",
        url: "/api/comment/new/" + tutorial_id + "/" + user_id + "/" + comment_id,
        data: {content: content},
        success: function(data){
        	if(data['success']){
        		var new_div = document.getElementById(comment_id);
        		var new_subcomment_div = new_div.getElementsByClassName('_subcomment-section')[0].cloneNode(true);
        		new_subcomment_div.style.display='block';
        		new_subcomment_div.getElementsByClassName('_subcomment-content')[0].innerHTML = data['response'][0].content;
        		new_subcomment_div.getElementsByClassName('_subcomment-time')[0].innerHTML = data['response'][0].time;
        		new_div.getElementsByClassName('_subcomment-box')[0].appendChild(new_subcomment_div);
        		new_div.getElementsByClassName('new_subcommment_content')[0].value = "";
        	}else{
        		alert("comments are broken. ur doomed. gg.");
        	}
    	},
    	error: function (request, status, error) {
    		console.log("Can't add subcomments. rip.");
   		}
    });
}

function votecomment(element, up_or_down){
	var comment_id = element.parentNode.id;
	$.ajax({
		type: "POST",
		data: {},
        url: "/api/comment/vote/" + comment_id + "/" + up_or_down,
        success: function(data){
        	if(data['needToUpdate'] == true){
        		element.parentNode.getElementsByClassName('_comment-vote')[0].innerHTML = data['score'];
        	}
    	},
    	error: function (request, status, error) {
    		console.log("Can't vote... rip.");
   		}
    });
}

$(document).ready(function() {
	get_comments();
});
