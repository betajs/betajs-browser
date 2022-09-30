Scoped.define("module:Upload.S3MultipartFileUploader", [
    "module:Upload.FileUploader",
    "module:Upload.MultiUploader",
    "module:Upload.S3MultipartSupport"
], function(FileUploader, MultiUploader, S3Support, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, function(inherited) {
        return {
            constructor: function(options) {
                inherited.constructor.call(this, options);
                this._parts = [];
                this._multiUploader = new MultiUploader({
                    uploadLimit: this._options.uploadLimit
                });
            },

            destroy: function() {
                this._multiUploader.destroy();
                inherited.destroy.call(this);
            },

            reset: function() {
                inherited.reset.call(this);
                this._parts = [];
                this._multiUploader.destroy();
                this._multiUploader = new MultiUploader({
                    uploadLimit: this._options.uploadLimit
                });
            },

            getUploadId: function() {
                return this._options.uploadId;
            },

            _upload: function() {
                var file = this._options.isBlob ? this._options.source : this._options.source.files[0];
                if (!S3Support.validateFileSize(file.size)) {
                    this._setState("error", "File size is too big");
                    return;
                }

                var chunks = S3Support.chunkFile(file, {
                    numberOfChunks: this._options.parts,
                    chunkSize: this._options.chunkSize
                });

                var maximumNumberOfParts = 0;
                for (var p in this._options.urls) {
                    if (this._options.urls.hasOwnProperty(p)) {
                        maximumNumberOfParts++;
                    }
                }

                if (chunks.length > maximumNumberOfParts) {
                    this._setState("error", "Not enough parts to upload file");
                    return;
                }

                chunks.forEach(function(chunk, index) {
                    var partNumber = index + 1;
                    var chunkUploader = this._multiUploader.auto_destroy(FileUploader.create({
                        method: "PUT",
                        url: this._options.urls[partNumber],
                        source: chunk,
                        resilience: this._options.resilience,
                        noFormData: true
                    }));
                    
                    this._multiUploader.addUploader(chunkUploader);
                    chunkUploader.on("success", function(_, request) {
                        this._parts.push({
                            ETag: request.getResponseHeader("ETag"),
                            PartNumber: partNumber
                        });
                    }, this);
                }.bind(this));

                this._multiUploader
                    .on("error", this._errorCallback, this)
                    .on("progress", this._progressCallback, this)
                    .on("success", function() {
                        this._successCallback(S3Support.sortParts(this._parts));
                    }, this);

                this._multiUploader.upload();
            }
        };
    }, {
        supported: function(options) {
            return options.s3 && options.urls;
        }
    });
});