QUnit.test("test unresolved", function (assert) {
	assert.deepEqual(Scoped.unresolved("global:BetaJS.Browser").filter(function (s) {
		return s.indexOf("Resumable") === -1;
	}), []);
});