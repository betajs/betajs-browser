test("jsdom", function () {
	stop();
	require('jsdom').env("<div><div id='qunit-fixture'></div></div>", ["./vendors/jquery.min.js"], function (err, window) {
		global.window = window;
		global.navigator = window.navigator;
		global.document = window.document;
		global.jQuery = window.$;
		global.$ = window.$;
		Scoped.define("global:jQuery", function () {
			return window.$;
		});
		ok(true);
		start();
	});		
});
