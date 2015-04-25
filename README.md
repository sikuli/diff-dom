# diff-dom

A visual diff tool for webpages. Bring attention to small but potentially breaking changes to your layout.
* Changes in an element's dimensions are yellow
* Changes in an element's position are purple
* Changes in both dimensions and position are gray

Unlike some CSS regression test tools out there, this one outputs a full HTML file, not an image. It analyzes each element's computed styling rather than performing a pixel-by-pixel image diff.

# Install

	$ npm install

# Run the basic test

	$ node test.js http://example.com/versionA.html http://example.com/versionB.html output.html
	
You can specify the two versions of the webpage to be diffed by URL or by absolute filepath.
	
Example pages to diff can be found in the data directory, or at http://emilybertelson.com/css_tests/

