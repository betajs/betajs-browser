test("remove mutation", function () {
	$("#qunit-fixture").html("<div id='test-mutation'></div>");
	var observer = BetaJS.Browser.DomMutation.NodeRemoveObserver.create($("#test-mutation").get(0));
	observer.on("node-removed", function () {
		ok(true);
		observer.destroy();
		start();
	});
	stop();
	$("#test-mutation").remove();	
});

test("insert mutation immediate", function () {
	if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() < 9) {
		ok(true);
		return;
	}
	$("#qunit-fixture").html("<div id='test-mutation'></div>");
	var observer = BetaJS.Browser.DomMutation.NodeInsertObserver.create({
		parent: $("#qunit-fixture").get(0)
	});
	observer.on("node-inserted", function (node) {
		ok(true);
		observer.destroy();
		start();
	});
	stop();
	$("#qunit-fixture").append("<div></div>");
});

test("insert mutation deeper", function () {
	if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() < 9) {
		ok(true);
		return;
	}
	$("#qunit-fixture").html("<div id='test-mutation'></div>");
	var observer = BetaJS.Browser.DomMutation.NodeInsertObserver.create();
	observer.on("node-inserted", function (node) {
		ok(true);
		observer.destroy();
		start();
	});
	stop();
	$("#qunit-fixture").append("<div></div>");
});

test("insert mutation inner deeper", function () {
	if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() < 9) {
		ok(true);
		return;
	}
	$("#qunit-fixture").html("<div id='test-mutation'></div>");
	var observer = BetaJS.Browser.DomMutation.NodeInsertObserver.create();
	var counter = 0;
	observer.on("node-inserted", function (node) {
		counter++;
		if (counter !== 2)
			return;
		ok(true);
		observer.destroy();
		start();
	});
	stop();
	$("#qunit-fixture").append("<div><div></div></div>");
});
