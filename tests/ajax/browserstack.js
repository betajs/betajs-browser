MockAjax.loadStyles("http://code.jquery.com/qunit/qunit-1.11.0.css");
MockAjax.loadScriptList([
	"http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js",
	"http://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.1.1/es5-shim.js",
	"http://cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.js",
	MockAjax.originUrl + "/../../vendors/betajs-shims.js",
	MockAjax.originUrl + "/../../vendors/scoped.js",
	MockAjax.originUrl + "/../../vendors/beta-noscoped.js",
	MockAjax.originUrl + "/../../dist/betajs-browser-noscoped.js",
	"http://code.jquery.com/qunit/qunit-1.11.0.js",
	MockAjax.originUrl + "/helper.js",
	MockAjax.originUrl + "/tests.js"
], function () {
	QUnit.done(function(results) {
		if (results.failed === 0)
			document.location.href = MockAjax.originUrl + "/browserstack_success.html" + document.location.search;
	});
});
