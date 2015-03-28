(function ($, undefined) {
    $.fn.getCursorPosition = function() {
        var el = $(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }
})(jQuery);

//in edit checks if someone else merged in already
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

//for the ctrl + p --> preview hotkey
function preview(){
    document.getElementsByClassName('btn-sm')[9].click();
}

$(document).ready(function() {
    
    $(document).bind('keydown', 'ctrl+p', preview);
    
});

if (typeof exports === 'object') {
  exports.can_submit = can_submit;
}