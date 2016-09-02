
Scoped.define("module:Upload.FormIframeFileUploader", [
     "module:Upload.FileUploader",
     "jquery:",
     "base:Net.Uri",
     "base:Objs"
], function (FileUploader, $, Uri, Objs, scoped) {
	return FileUploader.extend({scoped: scoped}, {
		
		_upload: function () {
			var self = this;
			var iframe = document.createElement("iframe");
			var id = "upload-iframe-" + this.cid();
			iframe.id = id;
			iframe.name = id;
			iframe.style.display = "none";
			var form = document.createElement("form");
			form.method = "POST";
			form.target = id;
			form.style.display = "none";
			document.body.appendChild(iframe);
			document.body.appendChild(form);
			var oldParent = this._options.source.parent;
			form.appendChild(this._options.source);
			Objs.iter(this._options.data, function (value, key) {
				var input = document.createElement("input");
				input.type = "hidden";
				input.name = key;
				input.value = value;
				form.appendChild(input);				
			}, this);
			var post_message_fallback = !("postMessage" in window);
			iframe.onerror = function () {
				if (post_message_fallback)
					window.postMessage = null;
				$(window).off("message." + self.cid());
				if (oldParent)
					oldParent.appendChild(this._options.source);
				document.body.removeChild(form);
				document.body.removeChild(iframe);
				self._errorCallback();
			};				
			form.action = Uri.appendUriParams(this._options.url, {"_postmessage": true});
			form.encoding = form.enctype = "multipart/form-data";
			var handle_success = function (raw_data) {
				if (post_message_fallback)
					window.postMessage = null;
				$(window).off("message." + self.cid());
				if (oldParent)
					oldParent.appendChild(this._options.source);
				var data = JSON.parse(raw_data);
				document.body.removeChild(form);
				document.body.removeChild(iframe);
				self._successCallback(data);
			};
			$(window).on("message." + this.cid(), function (event) {
				handle_success(event.originalEvent.data);
			});
			if (post_message_fallback) 
				window.postMessage = handle_success;
			form.submit();
		}
		
	}, {
		
		supported: function (options) {
			return !options.isBlob && options.serverSupportPostMessage;
		}
		
	});	
});




Scoped.extend("module:Upload.FileUploader", [
	"module:Upload.FileUploader",
	"module:Upload.FormDataFileUploader",
	"module:Upload.FormIframeFileUploader",
	"module:Upload.CordovaFileUploader"
], function (FileUploader, FormDataFileUploader, FormIframeFileUploader, CordovaFileUploader) {
	FileUploader.register(FormDataFileUploader, 2);
	FileUploader.register(FormIframeFileUploader, 1);
	FileUploader.register(CordovaFileUploader, 4);
	return {};
});

