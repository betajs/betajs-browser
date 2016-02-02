test("test entities to unicode", function() {
	QUnit.equal(BetaJS.Browser.Dom.entitiesToUnicode("&auml;&ouml;&uuml;").length, 3);
});