var corsHost = BetaJS.Net.Uri.decodeUriParams(document.location.search.substring(1)).cors;

if (!corsHost) {
	corsHost = document.location.hostname + ":" + (parseInt(document.location.port, 10) + 1);
	$('#cors-warning').show();
}

corsHost = document.location.protocol + "//" + corsHost;

window.Helper = {
		
	__lastId: 0,
	
	newId: function () {
		var t = BetaJS.Time.now();
		this.__lastId = t > this.__lastId ? t : this.__lastId + 1;
		return this.__lastId;
	},
	
	createRequest: function (clientOptions, serverOptions) {
		var id = this.newId();
		clientOptions = BetaJS.Objs.extend({
			path: "/",
			cors: false
		}, clientOptions);
		serverOptions = BetaJS.Objs.extend({
			id: id
		}, serverOptions);
		var arr = [];
		for (var key in serverOptions)
			arr.push(key + ":" + serverOptions[key]);
		return {
			uri: (clientOptions.cors ? corsHost : "") + "/request/" + arr.join(",") + clientOptions.path,
			id: id
		};
	},
	
	createCrossCookie: function (cookiename, cookievalue) {
		var promise = BetaJS.Promise.create();
		BetaJS.Browser.Loader.loadByIframe({
			url: corsHost + "/setcookie?" + BetaJS.Net.Uri.encodeUriParams({
				name: cookiename,
				value: cookievalue
			}),
			remove: false
		}, function () {
			promise.asyncSuccess(true);
		});
		return promise;
	},
	
	requestLog: function (id) {
		var promise = BetaJS.Promise.create();
		BetaJS.Browser.Loader.loadByIframe({
			url: "/logs/" + id,
			remove: true
		}, function (textData) {
			try {
				promise.asyncSuccess(JSON.parse(textData));
			} catch (e) {
				promise.asyncError(e);
			}
		});
		return promise;
	},
	
	testSuccess: function (promise, callback, request) {
		stop();
		promise.error(function (e) {
			ok(false, "Should not fail: " + e);
			start();
		}).success(function (value) {
			Helper.requestLog(request.id).error(function (e) {
				ok(false, "Log should not fail");
				start();
			}).success(function (log) {
				callback(value, log);
				start();
			});
		});
	},
	
	testFail: function (promise, callback, request) {
		stop();
		promise.success(function () {
			ok(false, "Should fail");
			start();
		}).error(function (error) {
			Helper.requestLog(request.id).error(function (e) {
				ok(false, "Log should not fail");
				start();
			}).success(function (log) {
				callback(error, log);
				start();
			});
		});
	},
	
	test: function (opts) {
		var name = [];
		name.push(opts.method.toLowerCase());
		name.push(opts.origin + " origin");
		if (opts.jsondata)
			name.push("jsondata");
		if (opts.jsonp)
			name.push("jsonp");
		if (opts.postmessage)
			name.push("postmessage");
		if (opts.corscreds)
			name.push("cors credentials");
		name.push("status " + opts.status);
		name.push("cookie expect " + opts.cookie);
		name.push("should " + opts.should);
		
		test(name.join(", "), function () {
			
			var path = "/" + BetaJS.Tokens.generate_token();
			var querykey = BetaJS.Tokens.generate_token();
			var queryvalue = BetaJS.Tokens.generate_token();
			var datakey = BetaJS.Tokens.generate_token();
			var datavalue = BetaJS.Tokens.generate_token();
			if (opts.jsondata)
				datavalue = { foo: datavalue };
			var cookiekey = "ajax_unit_test";
			var cookievalue = BetaJS.Tokens.generate_token();
			var crosscookievalue = BetaJS.Tokens.generate_token();

			BetaJS.Browser.Cookies.set(cookiekey, cookievalue, null, "/");

			var request = Helper.createRequest({
				path: path,
				cors: opts.origin === "cross"
			}, {
				status: opts.status,
				cors: !!opts.servercors,
				corscreds: !!opts.corscreds,
				jsonp: !!opts.jsonp,
				postmessage: !!opts.postmessage
			});

			stop();
			Helper.createCrossCookie(cookiekey, crosscookievalue).error(function () {
				ok(false, "Setting cross cookie failed");
				start();
			}).success(function () {
				start();
				if (opts.should === "succeed") {
					Helper.testSuccess(BetaJS.Ajax.Support.execute({
						method: opts.method,
						uri: request.uri + "?" + querykey + "=" + queryvalue,
						data: BetaJS.Objs.objectBy(datakey, datavalue),
						jsonp: "jsonp",
						postmessage: "postmessage",
						forceJsonp: !!opts.jsonp,
						forcePostmessage: !!opts.postmessage,
						experimental: true,
						corscreds: !!opts.corscreds
					}), function (value, log) {
						QUnit.equal(log.response.status, opts.status);
						QUnit.equal(log.request.method, opts.method);
						QUnit.equal(log.request.path, path);
						QUnit.equal(log.request.query[querykey], queryvalue);
						if (opts.method !== "GET")
							QUnit.deepEqual(log.request.body[datakey], datavalue);
						QUnit.equal(log.request.cookies[cookiekey], opts.cookie === "same" ? cookievalue : (opts.cookie === "cross" ? crosscookievalue : undefined));
						QUnit.deepEqual(value, log);
					}, request);
				} else {
					Helper.testFail(BetaJS.Ajax.Support.execute({
						method: opts.method,
						uri: request.uri + "?" + querykey + "=" + queryvalue,
						data: BetaJS.Objs.objectBy(datakey, datavalue),
						jsonp: "jsonp",
						postmessage: "postmessage",
						forceJsonp: !!opts.jsonp,
						forcePostmessage: !!opts.postmessage,
						experimental: true,
						corscreds: !!opts.corscreds
					}), function (error, log) {
						QUnit.equal(log.response.status, opts.status);
						QUnit.equal(log.request.method, opts.method);
						QUnit.equal(log.request.path, path);
						QUnit.equal(log.request.query[querykey], queryvalue);
						if (opts.method !== "GET")
							QUnit.deepEqual(log.request.body[datakey], datavalue);
						QUnit.equal(log.request.cookies[cookiekey], opts.cookie === "same" ? cookievalue : (opts.cookie === "cross" ? crosscookievalue : undefined));
					}, request);
				}				
			});
			
		});
	}
					
};
