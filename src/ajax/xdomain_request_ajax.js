Scoped.define("module:Ajax.XDomainRequestAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Ajax.RequestException",
    "module:Info",
    "base:Async",
    "base:Ids"
], function(AjaxSupport, Uri, HttpHeader, Promise, Types, RequestException, Info, Async, Ids) {

    var Module = {

        // IE Garbage Collection for XDomainRequest is broken
        __requests: {},

        supports: function(options) {
            if (!window.XDomainRequest)
                return false;
            if (options.forceJsonp || options.forcePostmessage)
                return false;
            if (!options.isCorsRequest)
                return false;
            if (!Info.isInternetExplorer() || Info.internetExplorerVersion() > 9)
                return false;
            // TODO: Check Data
            return true;
        },

        execute: function(options) {
            var uri = Uri.appendUriParams(options.uri, options.query || {});
            if (options.method === "GET")
                uri = Uri.appendUriParams(uri, options.data || {});
            var promise = Promise.create();

            var xdomreq = new XDomainRequest();
            Module.__requests[Ids.objectId(xdomreq)] = xdomreq;

            xdomreq.onload = function() {
                // TODO: Figure out response type.
                AjaxSupport.promiseReturnData(promise, options, xdomreq.responseText, "json"); //options.decodeType);
                delete Module.__requests[Ids.objectId(xdomreq)];
            };

            xdomreq.ontimeout = function() {
                AjaxSupport.promiseRequestException(promise, HttpHeader.HTTP_STATUS_GATEWAY_TIMEOUT, HttpHeader.format(HttpHeader.HTTP_STATUS_GATEWAY_TIMEOUT), null, "json"); //options.decodeType);)
                delete Module.__requests[Ids.objectId(xdomreq)];
            };

            xdomreq.onerror = function() {
                AjaxSupport.promiseRequestException(promise, HttpHeader.HTTP_STATUS_BAD_REQUEST, HttpHeader.format(HttpHeader.HTTP_STATUS_BAD_REQUEST), null, "json"); //options.decodeType);)
                delete Module.__requests[Ids.objectId(xdomreq)];
            };

            uri = AjaxSupport.finalizeUri(options, uri);
            xdomreq.open(options.method, uri);

            Async.eventually(function() {
                if (options.method !== "GET" && !Types.is_empty(options.data)) {
                    if (options.contentType === "json")
                        xdomreq.send(JSON.stringify(options.data));
                    else {
                        xdomreq.send(Uri.encodeUriParams(options.data, undefined, true));
                    }
                } else
                    xdomreq.send();
            }, this);

            return promise;
        }

    };

    AjaxSupport.register(Module, 9);

    return Module;
});