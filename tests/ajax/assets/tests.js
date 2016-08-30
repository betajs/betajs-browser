
test("get, query, cookies, same origin", function () {

	var ajax = new BetaJS.Browser.JQueryAjax();
	
	var path = "/" + BetaJS.Tokens.generate_token();
	var querykey = BetaJS.Tokens.generate_token();
	var queryvalue = BetaJS.Tokens.generate_token();
	var cookiekey = "ajax_unit_test";
	var cookievalue = BetaJS.Tokens.generate_token();
	
	BetaJS.Browser.Cookies.set(cookiekey, cookievalue, null, "/");

	var request = Helper.createRequest({
		path: path
	});
		
	Helper.testSuccess(ajax.asyncCall({
		uri: request.uri + "?" + querykey + "=" + queryvalue 
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
		
});


test("get, query, cookies, cross origin fail", function () {
	
	var ajax = new BetaJS.Browser.JQueryAjax();
	
	var path = "/" + BetaJS.Tokens.generate_token();
	var querykey = BetaJS.Tokens.generate_token();
	var queryvalue = BetaJS.Tokens.generate_token();
	var cookiekey = "ajax_unit_test";
	var cookievalue = BetaJS.Tokens.generate_token();
	
	BetaJS.Browser.Cookies.set(cookiekey, cookievalue, null, "/");

	var request = Helper.createRequest({
		path: path,
		cors: true
	});

	Helper.testFail(ajax.asyncCall({
		uri: request.uri + "?" + querykey + "=" + queryvalue 
	}), function (error, log) {
		if (log.request) {
			QUnit.equal(log.request.path, path);
			QUnit.equal(log.request.query[querykey], queryvalue);
			QUnit.equal(log.request.cookies[cookiekey], undefined);
		} else
			ok(true);
	}, request);
	
});


test("get, query, cookies, cross origin", function () {
	
	var ajax = new BetaJS.Browser.JQueryAjax();
	
	var path = "/" + BetaJS.Tokens.generate_token();
	var querykey = BetaJS.Tokens.generate_token();
	var queryvalue = BetaJS.Tokens.generate_token();
	var cookiekey = "ajax_unit_test";
	var cookievalue = BetaJS.Tokens.generate_token();
	
	BetaJS.Browser.Cookies.set(cookiekey, cookievalue, null, "/");

	var request = Helper.createRequest({
		path: path,
		cors: true
	}, {
		cors: true
	});
	
	Helper.testSuccess(ajax.asyncCall({
		uri: request.uri + "?" + querykey + "=" + queryvalue 
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.cookies[cookiekey], undefined);
		QUnit.deepEqual(value, log);
	}, request);
	
});


test("post, query, data, cookies, same origin", function () {

	var ajax = new BetaJS.Browser.JQueryAjax();
	
	var path = "/" + BetaJS.Tokens.generate_token();
	var querykey = BetaJS.Tokens.generate_token();
	var queryvalue = BetaJS.Tokens.generate_token();
	var datakey = BetaJS.Tokens.generate_token();
	var datavalue = BetaJS.Tokens.generate_token();
	var cookiekey = "ajax_unit_test";
	var cookievalue = BetaJS.Tokens.generate_token();
	
	BetaJS.Browser.Cookies.set(cookiekey, cookievalue, null, "/");

	var request = Helper.createRequest({
		path: path
	});
		
	Helper.testSuccess(ajax.asyncCall({
		method: "POST",
		data: BetaJS.Objs.objectBy(datakey, datavalue),
		uri: request.uri + "?" + querykey + "=" + queryvalue
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.body[datakey], datavalue);
		QUnit.equal(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
		
});

test("post, query, cookies, cross origin fail", function () {

	var ajax = new BetaJS.Browser.JQueryAjax();
	
	var path = "/" + BetaJS.Tokens.generate_token();
	var querykey = BetaJS.Tokens.generate_token();
	var queryvalue = BetaJS.Tokens.generate_token();
	var datakey = BetaJS.Tokens.generate_token();
	var datavalue = BetaJS.Tokens.generate_token();
	var cookiekey = "ajax_unit_test";
	var cookievalue = BetaJS.Tokens.generate_token();
	
	BetaJS.Browser.Cookies.set(cookiekey, cookievalue, null, "/");

	var request = Helper.createRequest({
		path: path,
		cors: true
	});

	Helper.testFail(ajax.asyncCall({
		method: "POST",
		data: BetaJS.Objs.objectBy(datakey, datavalue),
		uri: request.uri + "?" + querykey + "=" + queryvalue 
	}), function (error, log) {
		if (log.request) {
			QUnit.equal(log.request.path, path);
			QUnit.equal(log.request.query[querykey], queryvalue);
			QUnit.equal(log.request.body[datakey], datavalue);
			QUnit.equal(log.request.cookies[cookiekey], undefined);
		} else
			ok(true);
	}, request);
	
});

test("post, query, cookies, cross origin", function () {

	var ajax = new BetaJS.Browser.JQueryAjax();
	
	var path = "/" + BetaJS.Tokens.generate_token();
	var querykey = BetaJS.Tokens.generate_token();
	var queryvalue = BetaJS.Tokens.generate_token();
	var datakey = BetaJS.Tokens.generate_token();
	var datavalue = BetaJS.Tokens.generate_token();
	var cookiekey = "ajax_unit_test";
	var cookievalue = BetaJS.Tokens.generate_token();
	
	BetaJS.Browser.Cookies.set(cookiekey, cookievalue, null, "/");

	var request = Helper.createRequest({
		path: path,
		cors: true
	}, {
		cors: true
	});
	
	Helper.testSuccess(ajax.asyncCall({
		method: "POST",
		data: BetaJS.Objs.objectBy(datakey, datavalue),
		uri: request.uri + "?" + querykey + "=" + queryvalue 
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.body[datakey], datavalue);
		QUnit.equal(log.request.cookies[cookiekey], undefined);
		QUnit.deepEqual(value, log);
	}, request);
	
});
