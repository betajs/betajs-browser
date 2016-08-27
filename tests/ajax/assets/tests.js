test("get request with query parameters, same origin", function () {

	var ajax = new BetaJS.Browser.JQueryAjax();
	
	var request = Helper.createRequest({
		path: "/foobar"
	});
	
	stop();
	ajax.asyncCall({
		uri: request.uri
	}).error(function (e) {
		ok(false, e);
		start();
	}).success(function () {
		Helper.requestLog(request.id).error(function (e) {
			ok(false, e);
			start();
		}).success(function (log) {
			QUnit.equal(log.request.path, "/foobar");
			start();
		});
	});
	
});


test("get request with query parameters, cross origin fail", function () {

	var ajax = new BetaJS.Browser.JQueryAjax();
	
	var request = Helper.createRequest({
		path: "/foobar",
		cors: true
	});
	
	stop();
	ajax.asyncCall({
		uri: request.uri
	}).success(function (e) {
		ok(false, "Cross Origin should fail");
		start();
	}).error(function () {
		Helper.requestLog(request.id).error(function (e) {
			ok(false, e);
			start();
		}).success(function (log) {
			QUnit.equal(log.request.path, "/foobar");
			start();
		});
	});
	
});


test("get request with query parameters, cross origin success", function () {

	var ajax = new BetaJS.Browser.JQueryAjax();
	
	var request = Helper.createRequest({
		path: "/foobar",
		cors: true
	}, {
		cors: true
	});
	
	stop();
	ajax.asyncCall({
		uri: request.uri
	}).error(function (e) {
		ok(false, e);
		start();
	}).success(function () {
		Helper.requestLog(request.id).error(function (e) {
			ok(false, e);
			start();
		}).success(function (log) {
			QUnit.equal(log.request.path, "/foobar");
			start();
		});
	});
	
});