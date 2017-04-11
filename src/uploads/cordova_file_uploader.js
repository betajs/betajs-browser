Scoped.define("module:Upload.CordovaFileUploader", [
    "module:Upload.FileUploader"
], function(FileUploader, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, {

        _upload: function() {
            var self = this;
            //var fileURI = this._options.source.localURL;
            var fileURI = this._options.source.fullPath.split(':')[1];
            var fileUploadOptions = new window.FileUploadOptions();
            fileUploadOptions.fileKey = "file";
            fileUploadOptions.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
            fileUploadOptions.mimeType = this._options.source.type;
            fileUploadOptions.httpMethod = "POST";
            fileUploadOptions.params = this._options.data;
            var fileTransfer = new window.FileTransfer();
            fileTransfer.upload(fileURI, this._options.url, function(data) {
                self._successCallback(data);
            }, function(data) {
                self._errorCallback(data);
            }, fileUploadOptions);
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