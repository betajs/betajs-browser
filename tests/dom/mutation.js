QUnit.test("remove mutation", function (assert) {
	document.getElementById("qunit-fixture").innerHTML = "<div id='test-mutation'></div>";
    var done = assert.async();
	var observer = BetaJS.Browser.DomMutation.NodeRemoveObserver.create(document.getElementById("test-mutation"));
	observer.on("node-removed", function () {
		assert.ok(true);
		observer.destroy();
		done();
	});
    document.getElementById("qunit-fixture").innerHTML = "";
});

QUnit.test("insert mutation immediate", function (assert) {
	if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() < 9) {
		assert.ok(true);
		return;
	}
    var done = assert.async();
    document.getElementById("qunit-fixture").innerHTML = "<div id='test-mutation'></div>";
	var observer = BetaJS.Browser.DomMutation.NodeInsertObserver.create({
		parent: document.getElementById("qunit-fixture")
	});
	observer.on("node-inserted", function (node) {
		assert.ok(true);
		observer.destroy();
		done();
	});
    document.getElementById("qunit-fixture").appendChild(BetaJS.Browser.Dom.elementByTemplate("<div></div>"));
});

QUnit.test("insert mutation deeper", function (assert) {
	if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() < 9) {
		assert.ok(true);
		return;
	}
    var done = assert.async();
    document.getElementById("qunit-fixture").innerHTML = "<div id='test-mutation'></div>";
	var observer = BetaJS.Browser.DomMutation.NodeInsertObserver.create();
	observer.on("node-inserted", function (node) {
		observer.destroy();
        assert.ok(true);
		done();
	});
    document.getElementById("qunit-fixture").appendChild(BetaJS.Browser.Dom.elementByTemplate("<div></div>"));
});

QUnit.test("insert mutation inner deeper", function (assert) {
	if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() < 9) {
		assert.ok(true);
		return;
	}
    var done = assert.async();
    document.getElementById("qunit-fixture").innerHTML = "<div id='test-mutation'></div>";
	var observer = BetaJS.Browser.DomMutation.NodeInsertObserver.create();
	var counter = 0;
	observer.on("node-inserted", function (node) {
		counter++;
		if (counter !== 2)
			return;
		assert.ok(true);
		observer.destroy();
		done();
	});
    document.getElementById("qunit-fixture").appendChild(BetaJS.Browser.Dom.elementByTemplate("<div><div></div></div>"));
});
