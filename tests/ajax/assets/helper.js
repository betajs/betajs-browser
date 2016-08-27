window.Helper = {
		
	lastRequestId: 0,
	
	createRequest: function (clientOptions, serverOptions) {
		this.lastRequestId++;
		clientOptions = BetaJS.Objs.extend({
			path: "/",
			cors: false
		}, clientOptions);
		serverOptions = BetaJS.Objs.extend({
			id: this.lastRequestId
		}, serverOptions);
		var arr = [];
		for (var key in serverOptions)
			arr.push(key + ":" + serverOptions[key]);
		var l = document.location;
		return {
			uri: l.protocol + "//" + l.hostname + ":" + (clientOptions.cors ? parseInt(l.port, 10) + 1 : l.port) + "/request/" + arr.join(",") + clientOptions.path,
			id: this.lastRequestId
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
	}
				
};