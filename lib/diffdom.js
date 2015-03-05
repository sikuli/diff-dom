var cheerio = require('cheerio');
var difflib = require('./jsdifflib');
var fs = require('fs');

var lib = {};
module.exports = lib;

// TODO: add pairedDiff functionality into diff and extend to depth of n
// make helper function to generate list of element combos based on specified depth

lib.oldDiff = function(html1, html2) {
	
	// perhaps add ability to pass in custom list of tags?

	var $ = cheerio.load(html1);
	var $$ = cheerio.load(html2);

	for(var i in defaultTags){
		var count = getCountDiff(defaultTags[i], $, $$);
		if(count !== 0)
			printCount(count, defaultTags[i]);
	}
}

lib.pairedDiff = function(html1, html2) {
	var $ = cheerio.load(html1);
	var $$ = cheerio.load(html2);

	for(var i in topLevelTags) {
		for(var j in innerTags) {
			var tag = topLevelTags[i] + ' ' + innerTags[j];
			var count = getCountDiff(tag, $, $$);
			if(count !== 0)
				printCount(count, tag);
		}
	}
}

lib.diff = function(html1, html2, html3, isWayback) {
	if(html1 === html3 || html2 === html3) {
		console.log('ERROR: attempted to both diff and write to ' + html3 + '. Check your inputs.');
		return;
	}
	var fhtml1 = fs.readFileSync(html1, 'utf8');
	var fhtml2 = fs.readFileSync(html2, 'utf8');
	var newHtml = '';

	fhtml1 = traverse(fhtml1);
	fhtml2 = traverse(fhtml2);

	var conglomerate = fhtml1+fhtml2;
	var $ = cheerio.load(conglomerate);
	var head1 = $('head').get(0);
	var head2 = $('head').get(1);
	var head1a = {};
	var head2a = {};
	// iterate through head1's childrem
	for(var i in $('head').get(0).children())
		console.log(i);

	if(head1 === head2)
		console.log("heads match.");
	else
		console.log('nuuu');

	var base = difflib.stringAsLines(fhtml1);
	var newtxt = difflib.stringAsLines(fhtml2);
	if(isWayback) {
		unWayback(base);
		unWayback(newtxt);
		//console.log(base);
		//console.log(newtxt);
	}

    var sm = new difflib.SequenceMatcher(base, newtxt);
    var opcodes = sm.get_opcodes();

    for(var i in opcodes) {
    	if(opcodes[i][0] === 'equal') {
    		newHtml += base.slice(opcodes[i][1], opcodes[i][2]).join('\r\n');
    	}
    	else if(opcodes[i][0] === 'replace') {
    		newHtml += wrap(
    			base.slice(opcodes[i][1], opcodes[i][2]).join('\r\n'),
    			'#E88787'
    		);
    	}
    	else if(opcodes[i][0] === 'insert') {
    		newHtml += wrap(
    			newtxt.slice(opcodes[i][3], opcodes[i][4]).join('\r\n'),
    			'#85DE81'
    		);
    	}	
    }

    var fhtml3 = fs.openSync(html3, 'w');
    fs.writeSync(fhtml3, newHtml);
    fs.closeSync(fhtml3);
    console.log('Diff written to ' + html3 + '.');
}

function wrap(text, color) {
	var $ = cheerio.load(text);
	if($('div').length === 0 && $('table').length === 0) {
		return '<span style="background-color: ' + color +
		'; box-shadow: 0px 0px 5px 5px ' + color + ';">' +
		text + '</span>';
	}
	else {
		return '<div style="background-color: ' + color +
		'; box-shadow: 0px 0px 5px 5px ' + color + ';">' +
		text + '</div>';
	}
}

function traverse(input) {
	var $ = cheerio.load(input);
	var head = $('head').get();
	// console.log(head);
	var body = $('body').get();

	return input;
}

function unWayback(htmlAsLines) {
	for(var i in htmlAsLines) {
		if(htmlAsLines[i] === '<!-- BEGIN WAYBACK TOOLBAR INSERT -->')
			htmlAsLines.splice(i, 185);
	}
}

function getCountDiff(element, html1, html2) {
	return html2(element).length - html1(element).length
}

function printCount(count, tag) {
	if(count > 0)
		console.log(tag + ': +' + count)
	else if(count < 0)
		console.log(tag + ': ' + count)
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

