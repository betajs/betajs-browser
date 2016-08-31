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
	}
				
};
