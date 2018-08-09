Scoped.define("module:Upload.StreamingFileUploader", [
    "module:Upload.FileUploader",
    "module:Upload.MultiUploader",
    "base:Promise",
    "base:Objs",
    "base:Tokens",
    "base:Ajax.Support"
], function(FileUploader, MultiUploader, Promise, Objs, Tokens, AjaxSupport, scoped) {

    return FileUploader.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                inherited.constructor.call(this, options);
                this._multiUploader = new MultiUploader({
                    uploadLimit: this._options.uploadLimit,
                    manualEnd: true
                });
                this._options.identifierParameter = this._options.identifierParameter || "identifier";
                this._options.chunks = Objs.extend({
                    chunkNumberParameter: "chunknumber"
                }, this._options.chunks);
                this._options.assembly = Objs.extend({
                    totalSizeParameter: "totalsize",
                    chunkNumberParameter: "chunknumber",
                    ajaxOptions: null
                }, this._options.assembly);
                this._identifier = this.__generateIdentifier();
                this._chunkNumber = 0;
                this._totalSize = 0;
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
                this._identifier = this.__generateIdentifier();
                this._chunkNumber = 0;
                this._totalSize = 0;
            },

            __generateIdentifier: function() {
                return Tokens.generate_token();
            },

            addChunk: function(blob) {
                var data = {};
                data[this._options.chunks.chunkNumberParameter] = this._chunkNumber + 1;
                data[this._options.identifierParameter] = this._identifier;
                this._multiUploader.addUploader(this._multiUploader.auto_destroy(FileUploader.create({
                    url: this._options.chunks.url || this._options.url,
                    source: blob,
                    data: Objs.extend(data, this._options.data)
                })));
                this._chunkNumber++;
                this._totalSize += blob.size;
            },

            end: function() {
                this._multiUploader.end();
            },

            _upload: function() {
                this._multiUploader.on("error", function(error) {
                    this._errorCallback(error);
                }, this).on("progress", function(uploaded, total) {
                    this._progressCallback(uploaded, total);
                }, this).on("success", function() {
                    var data = {};
                    data[this._options.identifierParameter] = this._identifier;
                    data[this._options.assembly.totalSizeParameter] = this._totalSize;
                    data[this._options.assembly.chunkNumberParameter] = this._chunkNumber;
                    AjaxSupport.execute(Objs.extend({
                        method: "POST",
                        uri: this._options.assembly.url || this._options.url,
                        data: Objs.extend(data, this._options.data)
                    }, this._options.assembly.ajaxOptions)).success(function() {
                        this._successCallback();
                    }, this).error(function(error) {
                        this._errorCallback(error);
                    }, this);
                }, this);
                this._multiUploader.upload();
            }

        };
    }, {

        supported: function(options) {
            return typeof(window.Blob) !== "undefined" && options.serverSupportsChunked;
        }

    });

});