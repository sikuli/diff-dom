var cheerio = require('cheerio');
var difflib = require('jsdifflib');
var fs = require('fs');

var lib = {};
module.exports = lib;

// TODO: add pairedDiff functionality into diff and extend to depth of n
// make helper function to generate list of element combos based on specified depth

lib.diff = function(html1, html2) {
	
	// perhaps add ability to pass in custom list of tags?

	var $ = cheerio.load(html1)
	var $$ = cheerio.load(html2)

	for(var i in defaultTags){
		var count = getCountDiff(defaultTags[i], $, $$)
		if(count !== 0)
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
			if(count !== 0)
				printCount(count, tag)
		}
	}
}

lib.newDiff = function(html1, html2, html3) {
	var fhtml1 = fs.readFileSync(html1, 'utf8');
	var fhtml2 = fs.readFileSync(html2, 'utf8');
	var newHtml = '';
	var base = difflib.stringAsLines(fhtml1);
	var newtxt = difflib.stringAsLines(fhtml2);
    var sm = new difflib.SequenceMatcher(base, newtxt);
    var opcodes = sm.get_opcodes();

    for(var i in opcodes) {
    	// unchanged
    	if(opcodes[i][0] === 'equal') {
    		for(var j = opcodes[i][1]; j < opcodes[i][2]; j++) {
    			newHtml += base[j];
    		}
    	}
    	// deletions
    	else if(opcodes[i][0] === 'replace') {
    		var wrapped = '<div style="background-color: #e88787; box-shadow: 0px 0px 7px 0px #e88787;">';
    		for(var j = opcodes[i][1]; j < opcodes[i][2]; j++) {
    			wrapped += base[j];
    		}	
    		wrapped += '</div>';
    		newHtml += wrapped;
    	}
    	// additions -- add into base
    	else if(opcodes[i][0] === 'insert') {
    		var wrapped = '<div style="background-color: #8CE887; box-shadow: 0px 0px 7px 0px #8CE887;">';
    		for(var j = opcodes[i][3]; j < opcodes[i][4]; j++) {
    			wrapped += newtxt[j];
    		}
    		wrapped += '</div>';
    		newHtml += wrapped;
    	}
    }
    var fhtml3 = fs.openSync(html3, 'w');
    fs.writeSync(fhtml3, newHtml);
    fs.closeSync(fhtml3);
}

// lib.highlightDiff = function(html1, html2) {
// 	var $ = cheerio.load(html1)
// 	var $$ = cheerio.load(html2)

// 	for(var i in defaultTags){
// 		var count = getCountDiff(defaultTags[i], $, $$)
// 		if(count !== 0) {
// 			// find the diff and highlight it
// 		}
// 	}
// }

function getCountDiff(element, html1, html2) {
	return html2(element).length - html1(element).length
}

function printCount(count, tag) {
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

