Scoped.define("module:Ajax.XDomainRequestAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Ajax.RequestException",
    "module:Info",
    "base:Async"
], function (AjaxSupport, Uri, HttpHeader, Promise, Types, RequestException, Info, Async) {
	
	var Module = {
		
		supports: function (options) {
			if (!window.XDomainRequest)
				return false;
			if (options.forceJsonp || options.forcePostmessage)
				return false;
			if (!options.isCorsRequest)
				return false;
			if (!Info.isInternetExplorer() || Info.internetExplorerVersion() > 9)
				return false;
			// TODO: Check Data
			return true;
		},
		
		execute: function (options) {
			var uri = Uri.appendUriParams(options.uri, options.query || {});
			if (uri.method === "GET")
				uri = Uri.appendUriParams(uri, options.data || {});
			var promise = Promise.create();
			
			var xdomreq = new XDomainRequest();

			xdomreq.onload = function () {
		    	// TODO: Figure out response type.
		    	AjaxSupport.promiseReturnData(promise, options, xdomreq.responseText, "json"); //options.decodeType);
			};
			
			xdomreq.ontimeout = function () {
				AjaxSupport.promiseRequestException(promise, HttpHeader.HTTP_STATUS_GATEWAY_TIMEOUT, HttpHeader.format(HttpHeader.HTTP_STATUS_GATEWAY_TIMEOUT), null, "json"); //options.decodeType);)
			};
			
			xdomreq.onerror = function () {
				AjaxSupport.promiseRequestException(promise, HttpHeader.HTTP_STATUS_BAD_REQUEST, HttpHeader.format(HttpHeader.HTTP_STATUS_BAD_REQUEST), null, "json"); //options.decodeType);)
			};
			
			xdomreq.open(options.method, uri);
			
			Async.eventually(function () {
				if (options.method !== "GET" && !Types.is_empty(options.data)) {
					if (options.contentType === "json")
						xdomreq.send(JSON.stringify(options.data));
					else {
						xdomreq.send(Uri.encodeUriParams(options.data));
					}
				} else
					xdomreq.send();
			}, this);
			
			return promise;
		}
			
	};
	
	AjaxSupport.register(Module, 9);
	
	return Module;
});

