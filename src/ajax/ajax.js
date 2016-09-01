Scoped.define("module:Ajax.XmlHttpRequestAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Ajax.RequestException"
], function (AjaxSupport, Uri, HttpHeader, Promise, Types, RequestException) {
	
	var Module = {
		
		supports: function (options) {
			if (!options.experimental)
				return false;
			if (!window.XMLHttpRequest)
				return false;
			// TODO: Check Data
			return true;
		},
		
		execute: function (options) {
			var uri = Uri.appendUriParams(options.uri, options.query || {});
			if (uri.method === "GET")
				uri = Uri.appendUriParams(uri, options.data || {});
			var promise = Promise.create();
			
			var xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function () {
			    if (xmlhttp.readyState === 4) {
			    	if (xmlhttp.status == HttpHeader.HTTP_STATUS_OK) {
				    	// TODO: Figure out response type.
				    	AjaxSupport.promiseReturnData(promise, xmlhttp.responseText, "json"); //options.decodeType);
			    	} else {
			    		AjaxSupport.promiseRequestException(promise, xmlhttp.status, xmlhttp.statusText, xmlhttp.responseText, "json"); //options.decodeType);)
			    	}
			    }
			};
			
			if (options.corscreds)
				xmlhttp.withCredentials = true;

			xmlhttp.open(options.method, uri, true);
			if (options.method !== "GET" && !Types.is_empty(options.data)) {
				xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xmlhttp.send(Uri.encodeUriParams(options.data));
			} else
				xmlhttp.send();
			
			return promise;
		}
			
	};
	
	AjaxSupport.register(Module, 10);
	
	return Module;
});

