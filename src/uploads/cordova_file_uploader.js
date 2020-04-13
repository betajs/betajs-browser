Scoped.define("module:Upload.CordovaFileUploader", [
    "module:Upload.FileUploader",
    "module:Info",
    "base:Promise",
    "base:Ajax.Support",
    "base:Objs"
], function(FileUploader, Info, Promise, AjaxSupport, Objs, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, {

        _acquirePermission: function() {
            var promise = Promise.create();
            if (Info.isAndroid()) {
                var perms = cordova.plugins.permissions;
                perms.checkPermission(perms.READ_EXTERNAL_STORAGE, function(status) {
                    if (!status.hasPermission) {
                        perms.requestPermission(perms.READ_EXTERNAL_STORAGE, function(status) {
                            if (status.hasPermission)
                                promise.asyncSuccess(true);
                            else
                                promise.asyncError("Access to storage was not granted");
                        }, function() {
                            promise.asyncError("Could not request storage permission");
                        });
                    } else
                        promise.asyncSuccess(true);
                }, function() {
                    promise.asyncError("Could not check storage permission");
                });
            } else
                promise.asyncSuccess(true);
            return promise;
        },

        _upload: function() {
            return this._acquirePermission().mapSuccess(function() {
                return window.resolveLocalFileSystemURL ? this._uploadWithLocalFileSystem() : this._uploadWithPlugin();
            }, this);
        },

        _uploadWithPlugin: function() {
            var self = this;
            //var fileURI = this._options.source.localURL;
            var fileURI = this._options.source.fullPath.split(':')[1];
            var fileUploadOptions = new window.FileUploadOptions();
            fileUploadOptions.fileKey = "file";
            fileUploadOptions.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
            fileUploadOptions.mimeType = this._options.source.type;
            fileUploadOptions.httpMethod = this._options.method;
            fileUploadOptions.params = this._options.data;
            var fileTransfer = new window.FileTransfer();
            fileTransfer.upload(fileURI, this._options.url, function(data) {
                self._successCallback(data);
            }, function(data) {
                self._errorCallback(data);
            }, fileUploadOptions);
        },

        _uploadWithLocalFileSystem: function() {
            var self = this;
            var fileURI = this._options.source.fullPath;
            window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
                        var blob = new Blob([new Uint8Array(this.result)], {
                            type: self._options.source.type
                        });
                        var data = Objs.clone(self._options.data || {}, 1);
                        data.file = blob;
                        return AjaxSupport.execute({
                            method: self._options.method,
                            uri: self._options.url,
                            decodeType: "text",
                            data: data
                        }, self._progressCallback, self).success(self._successCallback, self).error(self._errorCallback, self);
                    };
                    // Read the file as an ArrayBuffer
                    reader.readAsArrayBuffer(file);
                }, function(err) {
                    self._errorCallback(err);
                });
            }, function(err) {
                self._errorCallback(err);
            });
        }
    }, {

        supported: function(options) {
            var result = !!navigator.device &&
                !!navigator.device.capture &&
                !!navigator.device.capture.captureVideo &&
                !!(window.resolveLocalFileSystemURL || (window.FileTransfer && window.FileUploadOptions)) &&
                !options.isBlob &&
                ("localURL" in options.source || "fullPath" in options.source);
            return result;
        }

    });
});