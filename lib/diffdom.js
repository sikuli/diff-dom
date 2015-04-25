var cheerio = require('cheerio');
var difflib = require('./jsdifflib');
var fs = require('fs');

var parser = require('html2hscript');
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

var phantom = require('phantom');

var request = require('request');
var http = require('http');

var lib = {};
module.exports = lib;

lib.buildCssTree = function(url, filename) {
	phantom.create(function(ph) {
		console.log("Opening " + url);
	  	return ph.createPage(function(page) {
	    	return page.open(url, function(status) {
	      		console.log("Opened site? ", status);
	      		page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {

	                var result = page.evaluate(function() {

	                  	return buildTree($('body').first());

	                  	function buildTree(node) {
	                  		if($(node) == undefined) return;
	                  		var children = $(node).children();
	                  		var count = 0;
	                  		var childTags = [];
	                  		var realChildren = [];
                  			$(node).children().each(function(){
                  				// exclude the jQuery ref that we're having Phantom insert into the page
                  				if($(this).prop('tagName') !== 'SCRIPT'){
                  					count++;
	                  				var a = buildTree(this);
		                  			realChildren.push(a);	
                  				}
                  				
                  			});
                  			
                  			var newNode = {
                  				tagName: $(node).prop('tagName'),
                  				props: getProperties(node),
                  				children: realChildren,
                  				children_count: count
                  			};
                  			return newNode;
	                  	}

	                  	function getProperties(node) {
	                  		// grab a subset of CSS properties for the node.
	                  		// for now, we're concerned with changes in size and position of blocks.
	                  		var pos = $(node).offset();
	                  		return {
	                  			width: $(node).css('width'),
	                  			height: $(node).css('height'),
	                  			top: pos.top,
	                  			left: pos.left
	                  		};
	                  	}

	                }, function(result) {
	                	console.log('Writing to ' + filename + '...');
	                	fs.writeFile(filename, JSON.stringify(result), function(err) {
	                		if(err) {
	                			console.log(err);
	                		}
	                	});
	                	
	                  	console.log(filename + ' written.');
	                  	ph.exit();
	                  	
	                });
	      		});
	    	});
	  	});
	});
}


lib.process = function(filename1, filename2, url, output) {
	var tree1 = JSON.parse(fs.readFileSync(filename1, 'utf8'));
	var tree2 = JSON.parse(fs.readFileSync(filename2, 'utf8'));
	
	download(url, function(data) {
	  if (data) {
	    var $ = cheerio.load(data);
	    traverse_recurse(tree1, tree2, $, $('body'));

	    // output modified tree.
	    setTimeout(function() {
	    	fs.writeFileSync(output, $.html());
	    }, 2000);
	  }
	  else console.log("error");  
	});

	// Utility function that downloads a URL and invokes callback with the data.
	function download(url, callback) {
	  http.get(url, function(res) {
	    var data = "";
	    res.on('data', function (chunk) {
	      data += chunk;
	    });
	    res.on("end", function() {
	      callback(data);
	    });
	  }).on("error", function() {
	    callback(null);
	  });
	}

	// Assume that the trees are the same, save for CSS.
	function traverse_recurse(node1, node2, $, domnode) {
		if(node1 != null) { 
			if(node1.tagName !== node2.tagName) {
				// if we're here, the HTML is different.
				// TODO(?): highlight the further tree in a different color?
				// console.log(node1.tagName + ' !== ' + node2.tagName);
				return;
			}

			if(node1.tagName !== 'BODY') {  // exclude body; too prone to fluctuation.

				var sizeDifference = (node1.props.width != node2.props.width || node1.props.height != node2.props.height);
				var posDifference = (node1.props.top != node2.props.top || node1.props.left != node2.props.left);

				if(sizeDifference && posDifference) {
					$(domnode).css('background-color', 'rgba(150,150,160,0.3)');
					console.log('- size and positioning difference found');
				}
				else if(sizeDifference) {
					$(domnode).css('background-color', 'rgba(255,200,0,0.3)');
					console.log('- size difference found');
				}
				else if(posDifference) {
					$(domnode).css('background-color', 'rgba(255,0,230,0.3)');
					console.log('- positioning difference found');
				}
			}

			var len = node1.children.length;
			for(var i = 0; i < len; i++) {
				traverse_recurse(node1.children[i], node2.children[i], $, $(domnode).children().eq(i));
			}
		}	
	}
}