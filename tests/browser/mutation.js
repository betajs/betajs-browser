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

if (!BetaJS.Browser.Info.isInternetExplorer() || BetaJS.Browser.Info.internetExplorerVersion() > 8) {
	test("insert mutation", function () {
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
}