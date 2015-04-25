var dom = require('./lib/diffdom')

// TODO: more robust command line parsing

// It is an exercise left to the reader to determine how to ensure that
// these function calls execute sequentially in a... less bad way.
dom.buildCssTree(process.argv[2], 'outa.txt');
dom.buildCssTree(process.argv[3], 'outb.txt');

setTimeout(function() {
	console.log('Comparing trees.')
	dom.process('outa.txt', 'outb.txt', process.argv[3], process.argv[4]);
}, 15000);

console.log('Done. See ' + process.argv[4] + ' for output.');