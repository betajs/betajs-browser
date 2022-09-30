Scoped.define("module:Upload.FileUploader", [
    "base:Classes.ConditionalInstance",
    "base:Events.EventsMixin",
    "base:Objs",
    "base:Types",
    "base:Async",
    "base:Promise"
], function(ConditionalInstance, EventsMixin, Objs, Types, Async, Promise, scoped) {
    return ConditionalInstance.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        return {

            constructor: function(options) {
                inherited.constructor.call(this, options);
                // idle, uploading, success, error
                this._uploaded = 0;
                this._state = "idle";
            },

            _setState: function(state, triggerdata, xmlhttprequest) {
                this._state = state;
                this.trigger(state, triggerdata, xmlhttprequest);
                this.trigger("state", state, triggerdata, xmlhttprequest);
            },

            state: function() {
                return this._state;
            },

            data: function() {
                return this._data;
            },

            progress: function() {
                return {
                    uploaded: this._uploaded,
                    total: this._total
                };
            },

            reset: function() {
                if (this.state() === "error") {
                    this._setState("idle");
                    delete this._data;
                    this._uploaded = 0;
                    delete this._total;
                    delete this._request;
                }
            },

            upload: function() {
                if (this.state() !== "idle")
                    return this;
                this._setState("uploading");
                this.__upload();
                return this;
            },

            __upload: function() {
                this._upload();
                this._options.resilience--;
            },

            _upload: function() {},

            _progressCallback: function(uploaded, total) {
                if (this.state() !== "uploading")
                    return;
                this._uploaded = uploaded;
                this._total = total;
                this.trigger("progress", uploaded, total);
            },

            _successCallback: function(data) {
                if (this.state() !== "uploading")
                    return;
                this._data = data;
                this._setState("success", data, this._request);
            },

            _errorCallback: function(data) {
                if (this.state() !== "uploading")
                    return;
                try {
                    if (data.data)
                        data = data.data();
                    if (Types.is_string(data))
                        data = JSON.parse(data);
                } catch (e) {}
                if (this._options.resilience > 0) {
                    if (!this._options.resilienceCheck || this._options.resilienceCheck(data)) {
                        Async.eventually(function() {
                            this.__upload();
                        }, this, this._options.resilience_delay);
                        return;
                    }
                }
                if (!this._options.essential) {
                    this._successCallback({});
                    return;
                }
                this._data = data;
                this._setState("error", data, this._request);
            },

            uploadedBytes: function() {
                return this._uploaded;
            },

            totalBytes: function() {
                if (this._total)
                    return this._total;
                if (this._options.source) {
                    if (!this._options.isBlob && this._options.source.files && this._options.source.files[0])
                        return this._options.source.files[0].size;
                    return this._options.source.size || 0;
                }
                return 0;
            }

        };
    }], {

        _initializeOptions: function(options) {
            options = options || {};
            return Objs.extend({
                //url: "",
                //source: null,
                method: "POST",
                serverSupportChunked: false,
                serverSupportPostMessage: false,
                isBlob: typeof(window.Blob) !== "undefined" && options.source instanceof(window.Blob),
                resilience: 1,
                resilience_delay: 1000,
                s3: false,
                essential: true,
                data: {}
            }, options);
        }

    });
});


Scoped.define("module:Upload.CustomUploader", [
    "module:Upload.FileUploader"
], function(FileUploader, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, {

        _upload: function() {
            this.trigger("upload", this._options);
        },

        progressCallback: function(uploaded, total) {
            this._progressCallback(uploaded, total);
        },

        successCallback: function(data) {
            this._successCallback(data);
        },

        errorCallback: function(data) {
            this._errorCallback(data);
        }

    });
});



Scoped.extend("module:Upload.FileUploader", [
    "module:Upload.FileUploader",
    "module:Upload.FormDataFileUploader",
    "module:Upload.FormIframeFileUploader",
    "module:Upload.CordovaFileUploader",
    "module:Upload.ChunkedFileUploader",
    "module:Upload.S3MultipartFileUploader"
], function(FileUploader, FormDataFileUploader, FormIframeFileUploader, CordovaFileUploader, ChunkedFileUploader, S3MultipartFileUploader) {
    FileUploader.register(S3MultipartFileUploader, 5);
    FileUploader.register(ChunkedFileUploader, 4);
    FileUploader.register(CordovaFileUploader, 3);
    FileUploader.register(FormDataFileUploader, 2);
    FileUploader.register(FormIframeFileUploader, 1);
    return {};
});