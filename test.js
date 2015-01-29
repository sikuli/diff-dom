var dom = require('./lib/diffdom')
var fs = require('fs')

// TODO: more robust command line parsing
var html1 = fs.readFileSync(process.argv[2], 'utf8')
var html2 = fs.readFileSync(process.argv[3], 'utf8')

dom.diff(html1, html2)
dom.pairedDiff(html1, html2)
