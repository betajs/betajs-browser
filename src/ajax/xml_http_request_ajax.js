Scoped.define("module:Ajax.XmlHttpRequestAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Objs",
    "base:Ajax.RequestException",
    "module:Info"
], function(AjaxSupport, Uri, HttpHeader, Promise, Types, Objs, RequestException, Info) {

    var Module = {

        supports: function(options) {
            if (!window.XMLHttpRequest)
                return false;
            if (options.forceJsonp || options.forcePostmessage)
                return false;
            if (Info.isInternetExplorer() && Info.internetExplorerVersion() < 10 && options.isCorsRequest)
                return false;
            try {
                Objs.iter(options.data, function(value) {
                    if ((typeof Blob !== "undefined" && value instanceof Blob) || (typeof File !== "undefined" && value instanceof File))
                        options.requireFormData = true;
                });
                if (options.requireFormData)
                    new FormData();
            } catch (e) {
                options.requireFormData = false;
            }
            return true;
        },

        execute: function(options, progress, progressCtx) {
            var uri = Uri.appendUriParams(options.uri, options.query || {});
            if (options.method === "GET")
                uri = Uri.appendUriParams(uri, options.data || {});
            var promise = Promise.create();

            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === 4) {
                    if (HttpHeader.isSuccessStatus(xmlhttp.status) || (xmlhttp.status === 0 && xmlhttp.responseText)) {
                        AjaxSupport.promiseReturnData(promise, options, xmlhttp.responseText, options.decodeType || "json");
                    } else {
                        AjaxSupport.promiseRequestException(promise, xmlhttp.status, xmlhttp.statusText, xmlhttp.responseText, options.decodeType || "json");
                    }
                }
            };

            if (progress) {
                (xmlhttp.upload || xmlhttp).onprogress = function(e) {
                    if (e.lengthComputable)
                        progress.call(progressCtx || this, e.loaded, e.total);
                };
            }

            xmlhttp.open(options.method, uri, true);

            if (options.corscreds)
                xmlhttp.withCredentials = true;

            if (options.bearer)
                xmlhttp.setRequestHeader('Authorization', 'Bearer ' + options.bearer);

            if (options.method !== "GET" && !Types.is_empty(options.data)) {
                if (options.requireFormData) {
                    var formData = new FormData();
                    Objs.iter(options.data, function(value, key) {
                        formData.append(key, value);
                    }, this);
                    // xmlhttp.setRequestHeader("Content-Type", "multipart/form-data");
                    xmlhttp.send(formData);
                } else if (options.contentType === "json") {
                    if (options.sendContentType)
                        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xmlhttp.send(JSON.stringify(options.data));
                } else {
                    if (options.sendContentType)
                        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xmlhttp.send(Uri.encodeUriParams(options.data, undefined, true));
                }
            } else
                xmlhttp.send();

            return promise;
        }

    };

    AjaxSupport.register(Module, 10);

    return Module;
});