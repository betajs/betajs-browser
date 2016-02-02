test("test unresolved", function () {
	QUnit.deepEqual(Scoped.unresolved("global:BetaJS.Browser").filter(function (s) {
		return s.indexOf("Resumable") === -1;
	}), []);
});