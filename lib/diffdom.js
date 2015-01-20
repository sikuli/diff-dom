var cheerio = require('cheerio')

var lib = {}
module.exports = lib


lib.diff = function(html1, html2) {

	var $ = cheerio.load(html1)
	a = $('p').length

	var $ = cheerio.load(html2)
	b = $('p').length

    return b - a
}