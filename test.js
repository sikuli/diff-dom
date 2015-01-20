var dom = require('./lib/diffdom')
var fs = require('fs')

var html1 = fs.readFileSync('data/page1.html', 'utf8')
var html2 = fs.readFileSync('data/page2.html', 'utf8')

var d = dom.diff(html1, html2)
console.log(d)
