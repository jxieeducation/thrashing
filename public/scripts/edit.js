function can_submit(){
	var change_id = document.getElementById('change-id').innerHTML;
	var tutorial_id = document.getElementById('tutorial-id').innerHTML;
	var url = "/api/tutorial/" + tutorial_id + "/" + change_id;	

	$.ajax({
    	type: "GET",
    	dataType:'jsonp',
    	url: url,
    	success: function(data){
    		if (data['result'] == 0){
    			alert('Terribly sorry. The tutorial was changed by someone else just now.\nCan you please open a new tab and paste your contributions there?\nAgain, we need to improve this in the future. Please bear with us.');
    		} else {
                //not secure at all need to change when hv more time
    			document.getElementById("edit-form").submit();
    		}
    	},
    	error: function (request, status, error) {
    		console.log(request.responseText);
   		}
	});
	return false;
}

if (typeof exports === 'object') {
  exports.can_submit = can_submit;
}