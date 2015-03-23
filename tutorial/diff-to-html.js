var md = require("node-markdown").Markdown;

var colors = {'same': '#808080', 'added': '#008000', 'removed': '#E80000'}

function wrapper(md_content, color){
	return "<div style='margin:0px; color:" + color + "'>\n\t" + md(md_content) + "\n</div>\n";
}

function diff_to_html(diff){
	var output = "";

	for (var i = 0; i < diff.length; i++){
		var diff_part = diff[i];
		if (diff_part.added){
			output += wrapper(diff_part.value, colors['added']);
		} else if (diff_part.removed){
			output += wrapper(diff_part.value, colors['removed']);
		}else{
			output += wrapper(diff_part.value, colors['same']);
		}
	}
	return output;
}

module.exports = {
	diff_to_html: diff_to_html,
};