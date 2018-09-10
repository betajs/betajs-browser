Scoped.define("module:Upload.CordovaFileUploader", [
    "module:Upload.FileUploader",
    "module:Info",
    "base:Promise"
], function(FileUploader, Info, Promise, scoped) {
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
            }, this);
        }

    }, {

        supported: function(options) {
            var result = !!navigator.device &&
                !!navigator.device.capture &&
                !!navigator.device.capture.captureVideo &&
                !!window.FileTransfer &&
                !!window.FileUploadOptions &&
                !options.isBlob &&
                ("localURL" in options.source);
            return result;
        }

    });
});