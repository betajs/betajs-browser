Scoped.define("module:Ajax.IframePostmessageAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Ajax.RequestException",
    "base:Tokens",
    "base:Objs"
], function(AjaxSupport, Uri, HttpHeader, Promise, Types, RequestException, Tokens, Objs) {

    var id = 1;

    var Module = {

        supports: function(options) {
            if (!options.postmessage)
                return false;
            return true;
        },

        execute: function(options) {
            var postmessageName = "postmessage_" + Tokens.generate_token() + "_" + (id++);
            var params = Objs.objectBy(options.postmessage, postmessageName);
            params = Objs.extend(params, options.query);
            var uri = Uri.appendUriParams(options.uri, params);
            var iframe = document.createElement("iframe");
            iframe.id = postmessageName;
            iframe.name = postmessageName;
            iframe.style.display = "none";
            var form = document.createElement("form");
            form.method = options.method;
            form.target = postmessageName;
            uri = AjaxSupport.finalizeUri(options, uri);
            form.action = uri;
            form.style.display = "none";
            var promise = Promise.create();
            document.body.appendChild(iframe);
            document.body.appendChild(form);
            Objs.iter(options.data, function(value, key) {
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = Types.is_array(value) || Types.is_object(value) ? JSON.stringify(value) : value;
                form.appendChild(input);
            }, this);
            var post_message_fallback = !("postMessage" in window);
            var self = this;
            var handle_success = null;
            var message_event_handler = function(event) {
                handle_success(event.data);
            };
            handle_success = function(raw_data) {
                if (typeof raw_data === "string")
                    raw_data = JSON.parse(raw_data);
                if (!(postmessageName in raw_data))
                    return;
                raw_data = raw_data[postmessageName];
                if (post_message_fallback)
                    window.postMessage = null;
                window.removeEventListener("message", message_event_handler, false);
                document.body.removeChild(form);
                document.body.removeChild(iframe);
                AjaxSupport.promiseReturnData(promise, options, raw_data, "json"); //options.decodeType);
            };
            iframe.onerror = function() {
                if (post_message_fallback)
                    window.postMessage = null;
                window.removeEventListener("message", message_event_handler, false);
                document.body.removeChild(form);
                document.body.removeChild(iframe);
                // TODO
                //AjaxSupport.promiseRequestException(promise, xmlhttp.status, xmlhttp.statusText, xmlhttp.responseText, "json"); //options.decodeType);)
            };
            window.addEventListener("message", message_event_handler, false);
            if (post_message_fallback)
                window.postMessage = handle_success;
            form.submit();
            return promise;
        }

    };

    AjaxSupport.register(Module, 4);

    return Module;
});