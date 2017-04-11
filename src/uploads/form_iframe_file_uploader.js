Scoped.define("module:Upload.FormIframeFileUploader", [
    "module:Upload.FileUploader",
    "base:Net.Uri",
    "base:Objs",
    "base:Async"
], function(FileUploader, Uri, Objs, Async, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, {

        _upload: function() {
            var self = this;
            var iframe = document.createElement("iframe");
            var id = "upload-iframe-" + this.cid();
            iframe.id = id;
            iframe.name = id;
            iframe.style.display = "none";
            var form = document.createElement("form");
            form.method = "POST";
            form.target = id;
            form.style.display = "none";
            document.body.appendChild(iframe);
            document.body.appendChild(form);
            var oldParent = this._options.source.parent;
            form.appendChild(this._options.source);
            if (!this._options.source.name)
                this._options.source.name = "file";
            Objs.iter(this._options.data, function(value, key) {
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            }, this);
            var post_message_fallback = !("postMessage" in window);
            var handle_success = null;
            var message_event_handler = function(event) {
                handle_success(event.data);
            };
            iframe.onerror = function() {
                if (post_message_fallback)
                    window.postMessage = null;
                window.removeEventListener("message", message_event_handler, false);
                if (oldParent)
                    oldParent.appendChild(self._options.source);
                document.body.removeChild(form);
                document.body.removeChild(iframe);
                self._errorCallback();
            };
            var post_message_key = this._options.serverPostMessageKey || "_postmessage";
            var post_message_id_key = this._options.serverPostMessageIdKey || "_postmessageid";
            var post_message_id_value = this.cid();
            var support_id = this._options.serverSupportPostMessageId;
            var query_params = {};
            query_params[post_message_key] = true;
            if (support_id)
                query_params[post_message_id_key] = post_message_id_value;
            form.action = Uri.appendUriParams(this._options.url, query_params);
            form.encoding = form.enctype = "multipart/form-data";
            handle_success = function(raw_data) {
                try {
                    var data = JSON.parse(raw_data);
                    if (support_id && data[post_message_id_key] !== post_message_id_value)
                        return;
                    if (post_message_fallback)
                        window.postMessage = null;
                    if (oldParent)
                        oldParent.appendChild(self._options.source);
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                    self._successCallback(data);
                    Async.eventually(function() {
                        window.removeEventListener("message", message_event_handler, false);
                    });
                } catch (e) {}
            };
            window.addEventListener("message", message_event_handler, false);
            if (post_message_fallback)
                window.postMessage = handle_success;
            form.submit();
        }

    }, {

        supported: function(options) {
            return !options.isBlob && options.serverSupportPostMessage;
        }

    });
});