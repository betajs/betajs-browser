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
            // Worker
            if (typeof window === "undefined")
                return true;
            if (!window.XMLHttpRequest)
                return false;
            if (options.forceJsonp || options.forcePostmessage)
                return false;
            if (Info.isInternetExplorer() && Info.internetExplorerVersion() < 10 && options.isCorsRequest)
                return false;
            try {
                Objs.iter(options.data, function(value) {
                    if ((typeof(window.Blob) !== "undefined" && value instanceof(window.Blob)) || (typeof File !== "undefined" && value instanceof File))
                        options.requireFormData = true;
                });
                if (options.requireFormData)
                    new(window.FormData)();
            } catch (e) {
                options.requireFormData = false;
            }
            return true;
        },

        create: function() {
            return new XMLHttpRequest();
        },

        execute: function(options, progress, progressCtx, xmlhttp) {
            var uri = Uri.appendUriParams(options.uri, options.query || {});
            if (!options.methodSupportsPayload)
                uri = Uri.appendUriParams(uri, options.data || {});
            var promise = Promise.create();

            xmlhttp = xmlhttp || this.create();

            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === 4) {
                    if (HttpHeader.isSuccessStatus(xmlhttp.status) || (xmlhttp.status === 0 && xmlhttp.responseText)) {
                        AjaxSupport.promiseReturnData(promise, options, options.contentType === "binary" ? xmlhttp.response : (options.contentType === "xml" ? xmlhttp.responseXML : xmlhttp.responseText), options.decodeType || "json");
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

            uri = AjaxSupport.finalizeUri(options, uri);
            var parsed = Uri.parse(uri);

            if (Info.isFirefox() && parsed.user && parsed.password)
                uri = uri.replace(parsed.user + ":" + parsed.password + "@", "");

            xmlhttp.open(options.method, uri, true);

            if (options.corscreds)
                xmlhttp.withCredentials = true;

            if (options.bearer)
                xmlhttp.setRequestHeader('Authorization', 'Bearer ' + options.bearer);

            if (options.accept)
                xmlhttp.setRequestHeader("Accept", options.accept);

            if (options.contentType === "binary")
                xmlhttp.responseType = "blob";

            if (parsed.user || parsed.password)
                xmlhttp.setRequestHeader('Authorization', 'Basic ' + btoa(parsed.user + ':' + parsed.password));

            if (options.methodSupportsPayload && !Types.is_empty(options.data)) {
                if (options.requireFormData) {
                    var formData = new(window.FormData)();
                    Objs.iter(options.data, function(value, key) {
                        formData.append(key, value);
                    }, this);
                    // xmlhttp.setRequestHeader("Content-Type", "multipart/form-data");
                    xmlhttp.send(formData);
                } else if (options.contentType === "json") {
                    if (options.sendContentType)
                        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xmlhttp.send(JSON.stringify(options.data));
                } else if (options.contentType === "xml") {
                    xmlhttp.overrideMimeType('application/xml');
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