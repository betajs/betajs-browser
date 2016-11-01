
Scoped.define("module:Upload.FormDataFileUploader", [
    "module:Upload.FileUploader",
    "module:Info",
    "base:Ajax.Support",
    "base:Objs"
], function (FileUploader, Info, AjaxSupport, Objs, scoped) {
	return FileUploader.extend({scoped: scoped}, {
		
		_upload: function () {
			return AjaxSupport.execute({
				method: "POST",
				uri: this._options.url,
				decodeType: "text",
				data: Objs.extend({
					file: this._options.isBlob ? this._options.source : this._options.source.files[0]
				}, this._options.data)
			}, this._progressCallback, this).success(this._successCallback, this).error(this._errorCallback, this);
		}
		
	}, {
		
		supported: function (options) {
			if (Info.isInternetExplorer() && Info.internetExplorerVersion() <= 9)
				return false;
			try {
				new FormData();
			} catch (e) {
				return false;
			}
			return true;
		}
		
	});	
});


