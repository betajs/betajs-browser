Scoped.define("module:JQueryAjax", [
	    "base:Net.AbstractAjax",
	    "base:Net.AjaxException",
	    "base:Promise",
	    "module:Info",
	    "jquery:"
	], function (AbstractAjax, AjaxException, Promise, BrowserInfo, $, scoped) {
	return AbstractAjax.extend({scoped: scoped}, function (inherited) {
		return {
			
			_syncCall: function (options) {
				var result;
				$.ajax({
					type: options.method,
					async: false,
					url: options.uri,
					dataType: options.decodeType ? options.decodeType : null, 
					data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
					success: function (response) {
						result = response;
					},
					error: function (jqXHR, textStatus, errorThrown) {
						var err = "";
						try {
							err = JSON.parse(jqXHR.responseText);
						} catch (e) {
							err = JSON.parse('"' + jqXHR.responseText + '"');
						}
						throw new AjaxException(jqXHR.status, errorThrown, ee);
					}
				});
				return result;
			},
			
			_asyncCall: function (options, callbacks) {
				var promise = Promise.create();
				if (BrowserInfo.isInternetExplorer() && BrowserInfo.internetExplorerVersion() <= 9)
					$.support.cors = true;
				$.ajax({
					type: options.method,
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
							err = JSON.parse('"' + jqXHR.responseText + '"');
						}
						promise.asyncError(new AjaxException(jqXHR.status, errorThrown, err));
					}
				});
				return promise;
			}
			
		};
	});
});
	