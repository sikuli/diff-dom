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
		console.log("created phantom for " + url);
	  	return ph.createPage(function(page) {
	    	return page.open(url, function(status) {
	      		console.log("opened site? ", status);
	      		page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
	              	//jQuery Loaded.
              	
	                var result = page.evaluate(function() {

	                  	return buildCssTree($('body').first());

	                  	function buildCssTree(node) {
	                  		if($(node) == undefined) return;
	                  		var children = $(node).children();
	                  		var count = 0;
	                  		var childTags = [];
	                  		var realChildren = [];
                  			$(node).children().each(function(){
                  				// exclude the jQuery ref that we're having Phantom insert into the page
                  				if($(this).prop('tagName') !== 'SCRIPT'){
                  					count++;
	                  				var a = buildCssTree(this);
		                  			realChildren.push(a);	
                  				}
                  				
                  			});
                  			
                  			var newNode = {
                  				tagName: $(node).prop('tagName'),
                  				css: getCss(node),
                  				children: realChildren,
                  				children_count: count
                  			};
                  			return newNode;
	                  	}

	                  	function getCss(node) {
	                  		// grab a subset of CSS properties for the node.
	                  		// for now, we're concerned with changes in dimensions of blocks.
	                  		return {
	                  			// margin_bottom: $(node).css('margin-bottom'),
	                  			// margin_top: $(node).css('margin-top'),
	                  			// margin_left: $(node).css('margin-left'),
	                  			// margin_right: $(node).css('margin-right'),
	                  			width: $(node).css('width'),
	                  			height: $(node).css('height')
	                  		};
	                  	}

	                }, function(result) {
	                	console.log('writing to ' + filename);
	                	fs.writeFile(filename, JSON.stringify(result), function(err) {
	                		if(err) {
	                			console.log(err);
	                		}
	                	});
	                	
	                  	// console.log(result);
	                  	ph.exit();
	                  	
	                });
	      		});
	    	});
	  	});
	});
}

// Utility function that downloads a URL and invokes
// callback with the data.
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

lib.readFiles = function(filename1, filename2, url, output) {
	var tree1 = JSON.parse(fs.readFileSync(filename1, 'utf8'));
	var tree2 = JSON.parse(fs.readFileSync(filename2, 'utf8'));
	
	download(url, function(data) {
	  if (data) {
	    var $ = cheerio.load(data);

	    // var root = $('body');
	    traverse_recurse(tree1, tree2, $, $('body'));

	    // output modified tree.
	    setTimeout(function() {
	    	fs.writeFileSync(output, $.html());
	    }, 2000);
	  }
	  else console.log("error");  
	});

	// Assume that the trees are the same, save for CSS.
	function traverse_recurse(node1, node2, $, domnode) {
		if(node1 != null) {
			if(node1.tagName !== node2.tagName) {
				// if we're here, the HTML is different.
				// TODO(?): highlight the further tree in a different color?
				// console.log(node1.tagName + ' !== ' + node2.tagName);
				return;
			}
			for (var property in node1.css) {
				if(node1.tagName !== 'BODY') { // exclude body; too prone to fluctuation. not useful.
					if(node1.css[property] != node2.css[property]) {
						// either height or width have changed.
						$(domnode).css('background-color', '#FFCC33');
						console.log('difference found');
						break;
					}	
				}
			}
			var len = node1.children.length;
			for(var i = 0; i < len; i++) {
				traverse_recurse(node1.children[i], node2.children[i], $, $(domnode).children().eq(i));
			}
		}	
	}
}

// lib.diff = function(url1, url2) {
// 	// var fhtml1 = fs.readFileSync(html1, 'utf8');
// 	// var fhtml2 = fs.readFileSync(html2, 'utf8');
// 	// var newHtml = '';

// 	// var $ = cheerio.load(fhtml1);
// 	// var $$ = cheerio.load(fhtml2);
// 	// var root1 = $("body").get();
// 	// var root2 = $$("body").get();

// 	// var sheets = $$("style").get();
// 	// //var style = css($$(root2), $$(sheets));
	
// 	// console.log($(sheets).text());
// 	//console.log(style);

// 	// Open each input in phantom and extract a simplified version of each DOM tree, containing
// 	// calculated styles of interest to us. These trees are output as JSON to the two specified
// 	// txt files.
// 	// callbacks because the tree building takes a while...
	
	
// 	// var tree1, tree2;
// 	// nextStep(url1, url2, function() {
// 	// 	console.log(tree1);
// 	// });

// 	// function nextStep(url1, url2, callback) {
		
// 	// 	buildCssTree(url1, 'out1.txt', function() {
// 	// 		console.log('reading out1.txt into tree1');
// 	// 		tree1 = JSON.parse(fs.readFileSync('out1.txt', 'utf8'));
// 	// 		//console.log(tree1);
// 	// 	});
// 	// 	buildCssTree(url2, 'out2.txt', function() {
// 	// 		console.log('reading out2.txt into tree2');
// 	// 		tree2 = JSON.parse(fs.readFileSync('out2.txt', 'utf8'));
// 	// 	});
		
// 	// }
// }
	

// 	// function css2json(css) {
// 	//     var s = {};
// 	//     if (!css) return s;
// 	//     if (css instanceof CSSStyleDeclaration) {
// 	//         for (var i in css) {
// 	//             if ((css[i]).toLowerCase) {
// 	//                 s[(css[i]).toLowerCase()] = (css[css[i]]);
// 	//             }
// 	//         }
// 	//     } else if (typeof css == "string") {
// 	//         css = css.split("; ");
// 	//         for (var i in css) {
// 	//             var l = css[i].split(": ");
// 	//             s[l[0].toLowerCase()] = (l[1]);
// 	//         }
// 	//     }
// 	//     return s;
// 	// }

// 	function traverse_recurse(html1, html2) {

// 		// TODO: attribute comparison!
// 		// Also, how do we go about constructing the new tree?

// 		// put children into array
// 		if(!html1 || !html2) {
// 			console.log("stahp!!");
// 			return;
// 		}

// 		if(html1.name !== html2.name) {
// 			console.log (html1.name + " != " + html2.name);
// 			// too different -- replace and highlight as changed
// 			console.log("insertion/deletion goes here");
// 			return;
// 		}
// 		else {
// 			console.log (html1.name + " == " + html2.name);
// 			console.log("node attribute comparison goes here");

// 			// console.log($(html1).currentStyle);
// 			// console.log($$(html2).currentStyle);
// 			//console.log(css($(html1)));
// 			// and then recurse for each of the children
// 			var arr = [];
// 			var count = 0;
// 			var children1 = $(html1).children();
// 			var children2 = $$(html2).children();

// 			var css1 = $(html1).css("margin-left");
// 			console.log(css1);

// 			// identify which children are tags (and thus should be investigated further).
// 			// all tags have a 'name' property.
// 			for(var prop in children1) {
// 				if (children1.hasOwnProperty(prop) && children1[prop].hasOwnProperty('name')) {
// 					//console.log(children1[prop]);
// 					arr.push(children1[prop]);
// 					count++;
// 		        }
// 			}
// 			for(var prop in children2) {
// 				if (children2.hasOwnProperty(prop) && children2[prop].hasOwnProperty('name')) {
// 					arr.push(children2[prop]);
// 		        }
// 			}

// 			if(count === 0) console.log("no children.");
// 			else console.log('count: ' + count);
// 			for(var i = 0; i < count; i++) {
// 				traverse_recurse(arr[i], arr[i+count]);
// 			}
// 		}			
// 	}	

// function wrap(text, color) {
// 	var $ = cheerio.load(text);
// 	if($('div').length === 0 && $('table').length === 0) {
// 		return '<span style="background-color: ' + color +
// 		'; box-shadow: 0px 0px 5px 5px ' + color + ';">' +
// 		text + '</span>';
// 	}
// 	else {
// 		return '<div style="background-color: ' + color +
// 		'; box-shadow: 0px 0px 5px 5px ' + color + ';">' +
// 		text + '</div>';
// 	}
// }


// function unWayback(htmlAsLines) {
// 	for(var i in htmlAsLines) {
// 		if(htmlAsLines[i] === '<!-- BEGIN WAYBACK TOOLBAR INSERT -->')
// 			htmlAsLines.splice(i, 185);
// 	}
// }

// function getCountDiff(element, html1, html2) {
// 	return html2(element).length - html1(element).length
// }

// function printCount(count, tag) {
// 	if(count > 0)
// 		console.log(tag + ': +' + count)
// 	else if(count < 0)
// 		console.log(tag + ': ' + count)
// }