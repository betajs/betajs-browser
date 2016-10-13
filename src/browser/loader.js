Scoped.define("module:Loader", ["jquery:"], function ($) {
	return {				
		
		loadScript: function (url, callback, context) {
			var executed = false;
			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");
			script.src = url;
			script.onload = script.onreadystatechange = function() {
				if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					executed = true;
					script.onload = script.onreadystatechange = null;
					if (callback)
						callback.call(context || this, url);
					// Does not work properly if we remove the script for some reason if it is used the second time !?
					//head.removeChild(script);
				}
			};
			head.appendChild(script);
		},
		
		loadStyles: function (url, callback, context) {
			var executed = false;
			var head = document.getElementsByTagName("head")[0];
			var style = document.createElement("link");
			style.rel = "stylesheet";
			style.href = url;
			style.onload = style.onreadystatechange = function() {
				if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					executed = true;
					style.onload = style.onreadystatechange = null;
					if (callback)
						callback.call(context || this, url);
				}
			};
			head.appendChild(style);
		},
	
		inlineStyles: function (styles) {
			var head = document.getElementsByTagName("head")[0];
			var style = document.createElement("style");
			style.textContent = styles;
			head.appendChild(style);
			return style;
		},
		
		loadHtml: function (url, callback, context) {
			$.ajax({
				url: url,
				dataType: "html"
			}).done(function(content) {
				callback.call(context || this, content, url);
			});
		},
		
		findScript: function (substr) {
			for (var i = 0; i < document.scripts.length; ++i)
				if (document.scripts[i].src.toLowerCase().indexOf(substr.toLowerCase()) >= 0)
					return document.scripts[i];
			return null;
		},
		
		loadByIframe: function (options, callback, context) {
		    var iframe = document.createElement("iframe");
		    if (options.visible) {
			    iframe.style.border = "none";
			    iframe.style.width = "1px";
			    iframe.style.height = "1px";
		    } else {
		    	iframe.style.display = "none";
		    }
		    var loaded = function () {
		    	var body = null;
		    	var content = null;
		    	try {
		    		body = iframe.contentDocument.body;
		    		content = body.textContent || body.innerText;
		    	} catch (e) {}
		        callback.call(context || this, content, body, iframe);
		        if (options.remove)
		        	document.body.removeChild(iframe);
		    };
		    if (iframe.attachEvent)
		    	iframe.attachEvent("onload", loaded);
		    else
		    	iframe.onload = loaded;
		    iframe.src = options.url;
		    document.body.appendChild(iframe);
		}

	};
});