Scoped.define("module:Upload.FormDataFileUploader", [
    "module:Upload.FileUploader",
    "module:Info",
    "base:Ajax.Support",
    "base:Objs"
], function(FileUploader, Info, AjaxSupport, Objs, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, {

        _upload: function() {
	        var data = Objs.clone(this._options.data || {}, 1);
	        data.file = this._options.isBlob ? this._options.source : this._options.source.files[0];
            return AjaxSupport.execute({
                method: this._options.method,
                uri: this._options.url,
                decodeType: "text",
                data: data
            }, this._progressCallback, this).success(this._successCallback, this).error(this._errorCallback, this);
        }

    }, {

        supported: function(options) {
            if (Info.isInternetExplorer() && Info.internetExplorerVersion() <= 9)
                return false;
            try {
                new(window.FormData)();
            } catch (e) {
                return false;
            }
            return true;
        }

    });
});