MockAjax.loadStyles("http://code.jquery.com/qunit/qunit-1.23.1.css");
MockAjax.loadScriptList([
    "https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.7/es5-shim.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.7/es5-sham.min.js",
    "http://cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.js",
	MockAjax.originUrl + "/../../node_modules/betajs-shims/dist/betajs-shims.js",
	MockAjax.originUrl + "/../../node_modules/betajs-scoped/dist/scoped.js",
	MockAjax.originUrl + "/../../node_modules/betajs/dist/beta-noscoped.js",
	MockAjax.originUrl + "/../../dist/betajs-browser-noscoped.js",
	"http://code.jquery.com/qunit/qunit-1.23.1.js",
	MockAjax.originUrl + "/helper.js",
	MockAjax.originUrl + "/tests.js"
], function () {
	QUnit.done(function(results) {
		if (results.failed === 0)
			document.location.href = MockAjax.originUrl + "/browserstack_success.html" + document.location.search;
	});
	setTimeout(function () {
		if (QUnit.config.semaphore === undefined)
			QUnit.load();
	}, 5000);
});
