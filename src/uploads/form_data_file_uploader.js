Scoped.define("module:Upload.FormDataFileUploader", [
    "module:Upload.FileUploader",
    "module:Info",
    "base:Ajax.Support",
    "base:Objs",
    "base:Types"
], function(FileUploader, Info, AjaxSupport, Objs, Types, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, {

        _upload: function() {
            var file = this._options.isBlob ? this._options.source : this._options.source.files[0];
            var params = {
                method: this._options.method,
                uri: this._options.url,
                decodeType: "text"
            };
            if (Types.is_empty(this._options.data)) {
                Objs.extend(params, {
                    body: file
                });
            } else {
                var data = Objs.clone(this._options.data, 1);
                data.file = file;
                Objs.extend(params, {
                    data: data
                });
            }
            this._request = AjaxSupport.create();
            return AjaxSupport.execute(params, this._progressCallback, this, this._request).success(this._successCallback, this).error(this._errorCallback, this);
        }

    }, {

        supported: function(options) {
            if (Info.isInternetExplorer() && Info.internetExplorerVersion() <= 9 || (Info.isCordova() && ("localURL" in options.source || "fullPath" in options.source)))
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