QUnit.test("test os info", function(assert) {
	assert.notEqual(BetaJS.Browser.Info.formatOS(), "Unknown Operating System");
});

QUnit.test("test browser info", function(assert) {
	assert.notEqual(BetaJS.Browser.Info.formatBrowser(), "Unknown Browser");
});

QUnit.test("test flash info", function(assert) {
	assert.notEqual(BetaJS.Browser.Info.formatFlash().substring(0, 4), "Flash");
});
