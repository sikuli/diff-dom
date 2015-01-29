var cheerio = require('cheerio')

var lib = {}
module.exports = lib

lib.diff = function(html1, html2) {
	
	// perhaps add ability to pass in custom list of tags?

	var $ = cheerio.load(html1)
	var $$ = cheerio.load(html2)

	for(var i in defaultTags){
		var count = getCountDiff(defaultTags[i], $, $$)
		printCount(count, defaultTags[i])
	}
}

lib.pairedDiff = function(html1, html2) {
	var $ = cheerio.load(html1)
	var $$ = cheerio.load(html2)

	for(var i in topLevelTags) {
		for(var j in innerTags) {
			var tag = topLevelTags[i] + ' ' + innerTags[j]
			var count = getCountDiff(tag, $, $$)
			printCount(count, tag)
		}
	}
}

var getCountDiff = function(element, html1, html2) {
	return html2(element).length - html1(element).length
}

var printCount = function(count, tag) {
	if(count > 0)
		console.log(tag + ': +' + count)
	else if(count < 0)
		console.log(tag + ': ' + count)
}

var highlight = function(option, html1, html2) {
	// TODO: implement
	// option is either 'add' or 'remove'
	// wrap offending element in a div
}

var defaultTags = [
	'a',
	'blockquote',
	'br',
	'button',
	'caption',
	'comment',
	'dir',
	'div',
	'embed',
	'form',
	'frame',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'iframe',
	'img',
	'input',
	'li',
	'link',
	'noscript',
	'ol',
	'p',
	'script',
	'span',
	'table',
	'td',
	'textarea',
	'tr',
	'ul'
]

var topLevelTags = [
	'a',
	'div',
	'form',
	'ol',
	'p',
	'table',
	'ul'
]

var innerTags = [
	'a',
	'blockquote',
	'br',
	'button',
	'caption',
	'comment',
	'dir',
	'div',
	'embed',
	'frame',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'iframe',
	'img',
	'input',
	'li',
	'link',
	'noscript',
	'p',
	'span',
	'textarea',
	'tr'
]