Scoped.define("module:Ajax.JsonpScriptAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Ajax.RequestException",
    "base:Tokens",
    "base:Objs"
], function (AjaxSupport, Uri, HttpHeader, Promise, Types, RequestException, Tokens, Objs) {
	
	var id = 1;
	
	var Module = {
		
		supports: function (options) {
			if (!options.experimental)
				return false;
			if (!options.jsonp)
				return false;
			if (options.method !== "GET")
				return false;
			return true;
		},
		
		execute: function (options) {
			var callbackName = "jsonp_" + Tokens.generate_token() + "_" + (id++);
			var params = Objs.objectBy(options.jsonp, callbackName);
			params = Objs.extend(params, options.query);
			params = Objs.extend(params, options.data);
			var uri = Uri.appendUriParams(options.uri, params);
			
			window[callbackName] = function (data) {
				delete window[callbackName];
				AjaxSupport.promiseReturnData(promise, options, data, "json"); //options.decodeType);
			};
			
			var promise = Promise.create();
			
			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");
			var executed = false; 
			script.onerror = function () {
				AjaxSupport.promiseRequestException(promise, HttpHeader.HTTP_STATUS_BAD_REQUEST, HttpHeader.format(HttpHeader.HTTP_STATUS_BAD_REQUEST), null, "json"); //options.decodeType);)
			};			
			script.onload = script.onreadystatechange = function() {
				if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					executed = true;
					script.onload = script.onreadystatechange = null;
					head.removeChild(script);
				}
			};

			script.src = uri;
			head.appendChild(script);
			
			return promise;
		}
			
	};
	
	AjaxSupport.register(Module, 5);
	
	return Module;
});

