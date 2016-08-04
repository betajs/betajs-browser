Scoped.define("module:JQueryAjax", [
    "base:Net.Ajax",
    "base:Net.AjaxException",
    "base:Promise",
    "module:Info",
    "jquery:"
], function (Ajax, AjaxException, Promise, BrowserInfo, $, scoped) {
	var Cls = Ajax.extend({scoped: scoped},  {
		
		_asyncCall: function (options, callbacks) {
			var promise = Promise.create();
			if (BrowserInfo.isInternetExplorer() && BrowserInfo.internetExplorerVersion() <= 9)
				$.support.cors = true;
			$.ajax({
				type: options.method,
				cache: false,
				async: true,
				url: options.uri,
				dataType: options.decodeType ? options.decodeType : null, 
				data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
				success: function (response) {
					promise.asyncSuccess(response);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					var err = "";
					try {
						err = JSON.parse(jqXHR.responseText);
					} catch (e) {
						try {
							err = JSON.parse('"' + jqXHR.responseText + '"');
						} catch (e2) {
							err = {};
						}
					}
					promise.asyncError(new AjaxException(jqXHR.status, errorThrown, err));
				}
			});
			return promise;
		}
			
	}, {
		
		supported: function (options) {
			return true;
		}
		
	});
	
	Ajax.register(Cls, 1);
	
	return Cls;
});
	