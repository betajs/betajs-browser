test("test os info", function() {
	QUnit.notEqual(BetaJS.Browser.Info.formatOS(), "Unknown Operating System");
});

test("test browser info", function() {
	QUnit.notEqual(BetaJS.Browser.Info.formatBrowser(), "Unknown Browser");
});

test("test flash info", function() {
	QUnit.notEqual(BetaJS.Browser.Info.formatFlash().substring(0, 4), "Flash");
});
