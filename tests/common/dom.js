QUnit.test("test entities to unicode", function(assert) {
	assert.equal(BetaJS.Browser.Dom.entitiesToUnicode("&auml;&ouml;&uuml;").length, 3);
    assert.equal(BetaJS.Browser.Dom.entitiesToUnicode("<img id=&#61;&#61>"), "<img id===>");
});