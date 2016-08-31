Scoped.define("module:Ajax.XmlHttpRequestAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise"
], function (AjaxSupport, Uri, HttpHeader, Promise) {
	
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
			    if (xmlhttp.readyState == 4 && xmlhttp.status == HttpHeader.HTTP_STATUS_OK) {
			    	AjaxSupport.promiseReturnData(promise, xmlhttp.responseText, options.decodeType);
			    	return;
			    }
			    // TODO: Error Handling
			    // TODO: Data
			};

			xmlhttp.open(options.method, uri, true);
			xmlhttp.send();
			
			return promise;
		}
			
	};
	
	AjaxSupport.register(Module, 10);
	
	return Module;
});

