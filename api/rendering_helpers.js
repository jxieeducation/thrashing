var ObjectId = require('mongoose').Types.ObjectId;
var schema = require('./../schema/schema.js');

function dateFormater(date){
	return date.toLocaleString();
}

function linkNoHTTPFixer(link){
	if (!link){
		return "";
	}
	var url = link.toString();
	if (url.indexOf('http') == -1){
		return "http://" + url;
	}
	return url;
}

module.exports = {
	dateFormater: dateFormater,
	linkNoHTTPFixer: linkNoHTTPFixer
};
