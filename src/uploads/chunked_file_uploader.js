Scoped.define("module:Upload.ChunkedFileUploader", [
    "module:Upload.FileUploader",
    "module:Upload.MultiUploader",
    "module:Blobs",
    "base:Promise",
    "base:Objs",
    "base:Tokens",
    "base:Ajax.Support"
], function(FileUploader, MultiUploader, Blobs, Promise, Objs, Tokens, AjaxSupport, scoped) {

    return FileUploader.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                inherited.constructor.call(this, options);
                this._multiUploader = new MultiUploader({
                    uploadLimit: this._options.uploadLimit
                });
                this._options.identifierParameter = this._options.identifierParameter || "identifier";
                this._options.chunks = Objs.extend({
                    size: 1000000,
                    chunkNumberParameter: "chunknumber"
                }, this._options.chunks);
                this._options.assembly = Objs.extend({
                    fileNameParameter: "filename",
                    totalSizeParameter: "totalsize",
                    chunkNumberParameter: "chunknumber",
                    fileTypeParameter: "filetype",
                    ajaxOptions: null
                }, this._options.assembly);
            },

            destroy: function() {
                this._multiUploader.destroy();
                inherited.destroy.call(this);
            },

            reset: function() {
                inherited.reset.call(this);
                this._multiUploader.destroy();
                this._multiUploader = new MultiUploader({
                    uploadLimit: this._options.uploadLimit
                });
            },

            __generateIdentifier: function() {
                return Tokens.generate_token();
            },

            _upload: function() {
                var identifier = this.__generateIdentifier();
                var file = this._options.isBlob ? this._options.source : this._options.source.files[0];
                Blobs.loadFileIntoArrayBuffer(file).success(function(arrayBuffer) {
                    var chunkNumber = 0;
                    while (chunkNumber * this._options.chunks.size < file.size) {
                        var data = {};
                        data[this._options.chunks.chunkNumberParameter] = chunkNumber + 1;
                        data[this._options.identifierParameter] = identifier;
                        var offset = chunkNumber * this._options.chunks.size;
                        var size = Math.min(this._options.chunks.size, file.size - offset);
                        this._multiUploader.addUploader(this._multiUploader.auto_destroy(FileUploader.create({
                            url: this._options.chunks.url || this._options.url,
                            source: Blobs.createBlobByArrayBufferView(arrayBuffer, offset, size, file.type),
                            data: Objs.extend(data, this._options.data)
                        })));
                        chunkNumber++;
                    }
                    this._multiUploader.on("error", function(error) {
                        this._errorCallback(error);
                    }, this).on("progress", function(uploaded, total) {
                        this._progressCallback(uploaded, total);
                    }, this).on("success", function() {
                        var data = {};
                        data[this._options.identifierParameter] = identifier;
                        data[this._options.assembly.fileNameParameter] = file.name || "blob";
                        data[this._options.assembly.totalSizeParameter] = file.size;
                        data[this._options.assembly.chunkNumberParameter] = chunkNumber;
                        data[this._options.assembly.fileTypeParameter] = file.type;
                        AjaxSupport.execute(Objs.extend({
                            method: this._options.method,
                            uri: this._options.assembly.url || this._options.url,
                            data: Objs.extend(data, this._options.data)
                        }, this._options.assembly.ajaxOptions)).success(function() {
                            this._successCallback();
                        }, this).error(function(error) {
                            this._errorCallback(error);
                        }, this);
                    }, this);
                    this._multiUploader.upload();
                }, this);
            }

        };
    }, {

        supported: function(options) {
            return typeof(window.Blob) !== "undefined" && typeof FileReader !== "undefined" && typeof DataView !== "undefined" && options.serverSupportsChunked;
        }

    });

});