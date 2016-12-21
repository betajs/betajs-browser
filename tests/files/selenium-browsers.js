/*
 * Not supported:
 * - Safari: https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/4220
 * - Opera: https://www.browserstack.com/list-of-browsers-and-platforms?product=automate
 * - Edge: http://stackoverflow.com/questions/38749050/edge-upload-file-control-using-selenium
 * - iOS: Need to confirm with BrowserStack
 * - Android: Need to confirm with BrowserStack
 * - IE8 does not work properly via Selenium but works locally
 */

module.exports = [{
	'browserName' : 'chrome'
}, {
	'browserName' : 'firefox'
}, {
	'browserName' : 'internet explorer',
	'version' : '11'
}, {
	'browserName' : 'internet explorer',
	'version' : '10'
}, {
	'browserName' : 'internet explorer',
	'version' : '9'
}, {
	'browserName' : 'chrome',
	'version' : '18'
}, {
	'browserName' : 'firefox',
	'version' : '6'
}];