/*
 * Next
 *  - IFRAME
 */

var Ajax = BetaJS.Ajax.Support;


test("get, query, cookies, same origin", function () {

	var path = "/" + BetaJS.Tokens.generate_token();
	var querykey = BetaJS.Tokens.generate_token();
	var queryvalue = BetaJS.Tokens.generate_token();
	var cookiekey = "ajax_unit_test";
	var cookievalue = BetaJS.Tokens.generate_token();
	
	BetaJS.Browser.Cookies.set(cookiekey, cookievalue, null, "/");

	var request = Helper.createRequest({
		path: path
	});
		
	Helper.testSuccess(Ajax.execute({
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		experimental: true
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
		
});


test("get, query, cookies, same origin, jsonp", function () {
	
	var path = "/" + BetaJS.Tokens.generate_token();
	var querykey = BetaJS.Tokens.generate_token();
	var queryvalue = BetaJS.Tokens.generate_token();
	var cookiekey = "ajax_unit_test";
	var cookievalue = BetaJS.Tokens.generate_token();
	
	BetaJS.Browser.Cookies.set(cookiekey, cookievalue, null, "/");

	var request = Helper.createRequest({
		path: path
	}, {
		jsonp: true
	});
		
	Helper.testSuccess(Ajax.execute({
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		jsonp: "jsonp",
		forceJsonp: true,
		experimental: true
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
		
});


test("get, query, cookies, cross origin fail", function () {
	
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

	Helper.testFail(Ajax.execute({
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		experimental: true
	}), function (error, log) {
		if (log.request) {
			QUnit.equal(log.request.path, path);
			QUnit.equal(log.request.query[querykey], queryvalue);
			QUnit.notEqual(log.request.cookies[cookiekey], cookievalue);
		} else
			ok(true);
	}, request);
	
});


test("get, query, cookies, cross origin, no creds", function () {
	
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
	
	Helper.testSuccess(Ajax.execute({
		uri: request.uri + "?" + querykey + "=" + queryvalue ,
		experimental: true
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.notEqual(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
	
});


test("get, query, cookies, cross origin, with creds", function () {
	
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
		cors: true,
		corscreds: true
	});
	
	Helper.testSuccess(Ajax.execute({
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		experimental: true,
		corscreds: true
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.notEqual(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
	
});


test("get, query, cookies, cross origin, jsonp", function () {
	
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
		cors: true,
		jsonp: true
	});
	
	Helper.testSuccess(Ajax.execute({
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		jsonp: "jsonp",
		forceJsonp: true,
		experimental: true
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.notEqual(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
	
});


test("post, query, data, cookies, same origin", function () {

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
		
	Helper.testSuccess(Ajax.execute({
		method: "POST",
		data: BetaJS.Objs.objectBy(datakey, datavalue),
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		experimental: true
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.body[datakey], datavalue);
		QUnit.equal(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
		
});

test("post, query, data, cookies, same origin, jsonp", function () {

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
	}, {
		jsonp: true
	});
		
	Helper.testSuccess(Ajax.execute({
		method: "POST",
		data: BetaJS.Objs.objectBy(datakey, datavalue),
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		jsonp: "jsonp"
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.body[datakey], datavalue);
		QUnit.equal(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
		
});

test("post, query, cookies, cross origin fail", function () {

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

	Helper.testFail(Ajax.execute({
		method: "POST",
		data: BetaJS.Objs.objectBy(datakey, datavalue),
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		experimental: true
	}), function (error, log) {
		if (log.request) {
			QUnit.equal(log.request.path, path);
			QUnit.equal(log.request.query[querykey], queryvalue);
			QUnit.equal(log.request.body[datakey], datavalue);
			QUnit.notEqual(log.request.cookies[cookiekey], cookievalue);
		} else
			ok(true);
	}, request);
	
});

test("post, query, cookies, cross origin", function () {

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
	
	Helper.testSuccess(Ajax.execute({
		method: "POST",
		data: BetaJS.Objs.objectBy(datakey, datavalue),
		uri: request.uri + "?" + querykey + "=" + queryvalue ,
		experimental: true
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.body[datakey], datavalue);
		QUnit.notEqual(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
	
});

test("post, query, cookies, cross origin, with creds", function () {

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
		cors: true,
		corscreds: true
	});
	
	Helper.testSuccess(Ajax.execute({
		method: "POST",
		data: BetaJS.Objs.objectBy(datakey, datavalue),
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		corscreds: true,
		experimental: true
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.body[datakey], datavalue);
		QUnit.notEqual(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
	
});

/*
 * Does not work yet with jQuery + need iFrame variation as well
 * Need:
 *   - XmlHttpRequest
 *   - jsonp
 *   - iframe form
 */
/*
test("post, query, cookies, cross origin, jsonp", function () {

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
		cors: true,
		jsonp: true
	});
	
	Helper.testSuccess(Ajax.execute({
		method: "POST",
		data: BetaJS.Objs.objectBy(datakey, datavalue),
		uri: request.uri + "?" + querykey + "=" + queryvalue,
		jsonp: "jsonp"
	}), function (value, log) {
		QUnit.equal(log.request.path, path);
		QUnit.equal(log.request.query[querykey], queryvalue);
		QUnit.equal(log.request.body[datakey], datavalue);
		QUnit.notEqual(log.request.cookies[cookiekey], cookievalue);
		QUnit.deepEqual(value, log);
	}, request);
	
});
*/