/*!
betajs-browser - v1.0.140 - 2023-08-30
Copyright (c) Oliver Friedmann,Rashad Aliyev
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS.Browser');
Scoped.binding('base', 'global:BetaJS');
Scoped.define("module:", function () {
	return {
    "guid": "02450b15-9bbf-4be2-b8f6-b483bc015d06",
    "version": "1.0.140",
    "datetime": 1693425262199
};
});
Scoped.assumeVersion('base:version', '~1.0.104');
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
Scoped.define("module:Ajax.JsonpScriptAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Ajax.RequestException",
    "base:Tokens",
    "base:Objs",
    "base:Async",
    "module:Info"
], function(AjaxSupport, Uri, HttpHeader, Promise, Types, RequestException, Tokens, Objs, Async, Info) {

    var id = 1;

    var Module = {

        supports: function(options) {
            if (!options.jsonp)
                return false;
            if (options.method !== "GET")
                return false;
            return true;
        },

        execute: function(options) {
            var callbackName = "jsonp_" + Tokens.generate_token() + "_" + (id++);
            var params = Objs.objectBy(options.jsonp, callbackName);
            params = Objs.extend(params, options.query);
            params = Objs.extend(params, options.data);
            var uri = Uri.appendUriParams(options.uri, params);
            var hasResult = false;

            window[callbackName] = function(data) {
                if (hasResult)
                    return;
                hasResult = true;
                try {
                    delete window[callbackName];
                } catch (e) {
                    window[callbackName] = undefined;
                }
                AjaxSupport.promiseReturnData(promise, options, data, "json"); //options.decodeType);
            };

            var promise = Promise.create();

            var head = document.getElementsByTagName("head")[0];
            var script = document.createElement("script");
            var executed = false;
            script.onerror = function(event) {
                if (event) {
                    if (event.stopPropagation)
                        event.stopPropagation();
                    else
                        event.cancelBubble = true;
                }
                if (hasResult)
                    return;
                hasResult = true;
                AjaxSupport.promiseRequestException(promise, HttpHeader.HTTP_STATUS_BAD_REQUEST, HttpHeader.format(HttpHeader.HTTP_STATUS_BAD_REQUEST), null, "json"); //options.decodeType);)
            };
            script.onload = script.onreadystatechange = function() {
                if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                    executed = true;
                    script.onload = script.onreadystatechange = null;
                    head.removeChild(script);
                    if (Info.isInternetExplorer() && Info.internetExplorerVersion() < 9) {
                        Async.eventually(function() {
                            if (!hasResult)
                                script.onerror();
                        });
                    }
                }
            };

            uri = AjaxSupport.finalizeUri(options, uri);
            script.src = uri;
            head.appendChild(script);

            return promise;
        }

    };

    AjaxSupport.register(Module, 5);

    return Module;
});
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
                if (options.noFormData) {
                    xmlhttp.send(options.data.file);
                } else if (options.requireFormData) {
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
Scoped.define("module:Apps", [
    "base:Time",
    "base:Async",
    "base:Promise",
    "module:Info",
    "module:Loader"
], function(Time, Async, Promise, Info, Loader) {
    return {

        STATE_INCOMPATIBLE_DEVICE: 1,
        STATE_APP_LAUNCHED: 2,
        STATE_APP_INSTALLED_AND_LAUNCHED: 3,
        STATE_APP_NOT_INSTALLED: 4,
        STATE_UNKNOWN: 5,

        //ios.launch, ios.install, android.intent, android.launch, android.install
        launch: function(options) {
            var promise = Promise.create();
            var start = Time.now();
            if (Info.isiOS() && options.ios) {
                Async.eventually(function() {
                    if (Time.now() - start > 3000)
                        promise.asyncSuccess(this.STATE_APP_LAUNCHED);
                    else {
                        start = Time.now();
                        Async.eventually(function() {
                            if (Time.now() - start > 3000)
                                promise.asyncSuccess(this.STATE_APP_INSTALLED_AND_LAUNCHED);
                            else
                                promise.asyncError(this.STATE_APP_NOT_INSTALLED);
                        }, this, 2500);
                        document.location = options.ios.install;
                    }
                }, this, 2500);
                document.location = options.ios.launch;
            } else
                /*if (Info.isAndroid() && options.android) {
				if (Info.isOpera()) {
					Loader.loadByIFrame({
						url: options.android.launch
					}, function () {
						document.location
					}, this);
				} else if (Info.isFirefox()) {
				} else {
					document.location = options.android.intent;
					promise.asyncSuccess(this.STATE_UNKNOWN);
				}
			} else*/
                promise.asyncError(this.STATE_INCOMPATIBLE_DEVICE);
            return promise;
        },

        appStoreLink: function(appIdent) {
            return "itms://itunes.apple.com/us/app/" + appIdent + "?mt=8&uo=4";
        },

        playStoreLink: function(appIdent) {
            return "https://play.google.com/store/apps/details?id=<" + appIdent + ">";
        },

        iOSAppURL: function(protocol, url) {
            return protocol + "://" + url;
        },

        androidAppUrl: function(protocol, url) {
            return protocol + "://" + url;
        },

        googleIntent: function(protocol, url, appIdent) {
            return "intent://" + url + ";scheme=" + protocol + ";package=" + appIdent + ";end";
        }

    };
});


/*
function launchAndroidApp(el) {
    heartbeat = setInterval(intervalHeartbeat, 200);
    if (navigator.userAgent.match(/Opera/) || navigator.userAgent.match(/OPR/)) {
        tryIframeApproach();
    } else if (navigator.userAgent.match(/Firefox/)) {
        webkitApproach();
        iframe_timer = setTimeout(function () {
            tryIframeApproach();
        }, 1500);
    } else if (navigator.userAgent.match(/Chrome/)) {
        document.location = googleIntent; // Use google intent
    } else { // Native browser ?
        document.location = googleIntent; // Use google intent
    }
}

function webkitApproach() {
    document.location = nativeAndroidUrl;
    timer = setTimeout(function () {
        document.location = googlePlayStore;
    }, 2500);
}

function clearTimers() {
    clearTimeout(timer);
    clearTimeout(heartbeat);
    clearTimeout(iframe_timer);
}

function intervalHeartbeat() {
    if (document.webkitHidden || document.hidden) {
        clearTimers();
    }
}

function tryIframeApproach() {
    var iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.onload = function () {
        document.location = googlePlayStore;
    };
    iframe.src = nativeAndroidUrl;
    document.body.appendChild(iframe);
}

 */
Scoped.define("module:Blobs", [
    "base:Promise"
], function(Promise) {
    return {

        createBlobByArrayBufferView: function(arrayBuffer, offset, size, type) {
            try {
                return new(window.Blob)([new DataView(arrayBuffer, offset, size)], {
                    type: type
                });
            } catch (err) {
                try {
                    return new(window.Blob)([new Uint8Array(arrayBuffer, offset, size)], {
                        type: type
                    });
                } catch (err2) {
                    var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                    var bb = new BlobBuilder();
                    bb.append(arrayBuffer.slice(offset, offset + size));
                    return bb.getBlob(type);
                }
            }
        },

        loadFileIntoArrayBuffer: function(file) {
            var promise = Promise.create();
            try {
                var fileReader = new FileReader();
                fileReader.onloadend = function(ev) {
                    promise.asyncSuccess(ev.target.result);
                };
                fileReader.readAsArrayBuffer(file.files ? file.files[0] : file);
            } catch (err) {
                promise.asyncError(err);
            }
            return promise;
        },

        loadFileIntoString: function(file) {
            var promise = Promise.create();
            try {
                var fileReader = new FileReader();
                fileReader.onloadend = function(ev) {
                    promise.asyncSuccess(ev.target.result);
                };
                fileReader.readAsText(file.files ? file.files[0] : file);
            } catch (err) {
                promise.asyncError(err);
            }
            return promise;
        }

    };
});
Scoped.define("module:Canvas", [
    "base:Maths"
], function(Maths) {
    return {
        isCanvasBlack: function(canvas) {
            if (!canvas) throw Error("Missing canvas");
            var data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            if (!data) return;
            var MAX_SAMPLE_SIZE = 10000;
            var sum = 0;
            var count = 0;
            if (canvas.width * canvas.height * 3 / 4 < MAX_SAMPLE_SIZE) { // sample all pixels
                sum = data.reduce(function(s, v, i) {
                    if (i && (i + 1) % 4 !== 0) {
                        s += v;
                        count++;
                    }
                    return s;
                });
                return sum / count < 10;
            } else { // random sampling
                count = MAX_SAMPLE_SIZE;
                for (var n = 0; n < MAX_SAMPLE_SIZE; n++) {
                    var i = Maths.randomInt(0, data.length);
                    while (i && (i + 1) % 4 === 0) i = Maths.randomInt(0, data.length);
                    sum += data[i];
                }
            }
            return sum / count < 10;
        },
        isImageBlack: function(image) {
            if (!image) throw Error("Missing image");
            var canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
            return this.isCanvasBlack(canvas);
        }
    };
});
Scoped.define("module:Cookies", ["base:Net.Cookies"], function(Cookies) {
    return {

        get: function(key) {
            return Cookies.getCookielikeValue(document.cookie, key);
        },

        /**
         * Will set the Cookie with provided settings
         *
         * @param {string} key
         * @param {string} value
         * @param {Date} end
         * @param {string} path
         * @param {string} domain
         * @param {boolean} secure
         * @param {'None'|'Lax'|'Strict'} sameSite
         */
        set: function(key, value, end, path, domain, secure, sameSite) {
            document.cookie = Cookies.createCookielikeValue(key, value, end, path, domain, secure, sameSite);
        },

        remove: function(key, value, path, domain) {
            document.cookie = Cookies.removeCookielikeValue(key, value, path, domain);
        },

        has: function(key) {
            return Cookies.hasCookielikeValue(document.cookie, key);
        },

        keys: function() {
            return Cookies.keysCookielike(document.cookie);
        }

    };
});
Scoped.define("module:Events", [
    "base:Class",
    "base:Objs",
    "base:Functions",
    "module:Dom"
], function(Class, Objs, Functions, Dom, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function() {
                inherited.constructor.call(this);
                this.__callbacks = {};
            },

            destroy: function() {
                this.clear();
                inherited.destroy.call(this);
            },

            on: function(element, events, callback, context, options) {
                events.split(" ").forEach(function(event) {
                    if (!event)
                        return;
                    var callback_function = Functions.as_method(callback, context || element);
                    element.addEventListener(event, callback_function, options && Dom.passiveEventsSupported() ? options : false);
                    this.__callbacks[event] = this.__callbacks[event] || [];
                    this.__callbacks[event].push({
                        element: element,
                        callback_function: callback_function,
                        callback: callback,
                        context: context
                    });
                }, this);
                return this;
            },

            off: function(element, events, callback, context) {
                events.split(" ").forEach(function(event) {
                    if (!event)
                        return;
                    var entries = this.__callbacks[event];
                    if (entries) {
                        var i = 0;
                        while (i < entries.length) {
                            var entry = entries[i];
                            if ((!element || element === entry.element) && (!callback || callback === entry.callback) && (!context || context === entry.context)) {
                                entry.element.removeEventListener(event, entry.callback_function, false);
                                entries[i] = entries[entries.length - 1];
                                entries.pop();
                            } else


                            ++i;
                        }
                    }
                }, this);
                return this;
            },

            clear: function() {
                Objs.iter(this.__callbacks, function(entries, event) {
                    entries.forEach(function(entry) {
                        entry.element.removeEventListener(event, entry.callback_function, false);
                    });
                });
                this.__callbacks = {};
            }

        };
    });
});
/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/

Scoped.define("module:FlashDetect", ["base:Class"], function(Class, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function() {
                inherited.constructor.call(this);
                this.__version = null;
                if (navigator.plugins && navigator.plugins.length > 0) {
                    var type = 'application/x-shockwave-flash';
                    var mimeTypes = navigator.mimeTypes;
                    if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description)
                        this.__version = this.parseVersion(mimeTypes[type].enabledPlugin.description);
                } else if (navigator.appVersion.indexOf("Mac") == -1 && "execScript" in window) {
                    for (var i = 0; i < this.__activeXDetectRules.length; i++) {
                        try {
                            var obj = new ActiveXObject(this.__activeXDetectRules[i].name);
                            var version = this.__activeXDetectRules[i].version(obj);
                            if (version) {
                                this.__version = this.parseActiveXVersion(version);
                                break;
                            }
                        } catch (err) {}
                    }
                }
            },

            parseVersion: function(str) {
                var descParts = str.split(/ +/);
                var majorMinor = descParts[2].split(/\./);
                var revisionStr = descParts[3];
                return {
                    "raw": str,
                    "major": parseInt(majorMinor[0], 10),
                    "minor": parseInt(majorMinor[1], 10),
                    "revisionStr": revisionStr,
                    "revision": parseInt(revisionStr.replace(/[a-zA-Z]/g, ""), 10)
                };
            },

            parseActiveXVersion: function(str) {
                var versionArray = str.split(",");
                return {
                    "raw": str,
                    "major": parseInt(versionArray[0].split(" ")[1], 10),
                    "minor": parseInt(versionArray[1], 10),
                    "revision": parseInt(versionArray[2], 10),
                    "revisionStr": versionArray[2]
                };
            },

            version: function() {
                return this.__version;
            },

            installed: function() {
                return this.__version !== null;
            },

            supported: function() {
                var ua = navigator.userAgent;
                return this.installed() || !(ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1 || ua.indexOf('iPad') != -1);
            },

            majorAtLeast: function(version) {
                return this.installed() && this.version().major >= version;
            },

            minorAtLeast: function(version) {
                return this.installed() && this.version().minor >= version;
            },

            revisionAtLeast: function(version) {
                return this.installed() && this.version().revision >= version;
            },

            versionAtLeast: function(major) {
                if (!this.installed())
                    return false;
                var properties = [this.version().major, this.version().minor, this.version().revision];
                var len = Math.min(properties.length, arguments.length);
                for (var i = 0; i < len; i++) {
                    if (properties[i] != arguments[i])
                        return properties[i] > arguments[i];
                }
                return true;
            },

            __activeXDetectRules: [{
                name: "ShockwaveFlash.ShockwaveFlash.7",
                version: function(obj) {
                    try {
                        return obj.GetVariable("$version");
                    } catch (err) {
                        return null;
                    }
                }
            }, {
                name: "ShockwaveFlash.ShockwaveFlash.6",
                version: function(obj) {
                    try {
                        obj.AllowScriptAccess = "always";
                        try {
                            return obj.GetVariable("$version");
                        } catch (err) {
                            return null;
                        }
                    } catch (err) {
                        return "6,0,21";
                    }
                }
            }, {
                name: "ShockwaveFlash.ShockwaveFlash",
                version: function(obj) {
                    try {
                        return obj.GetVariable("$version");
                    } catch (err) {
                        return null;
                    }
                }
            }]

        };
    });
});


Scoped.define("module:FlashHelper", [
    "base:Time", "base:Objs", "base:Types", "base:Net.Uri", "base:Ids", "module:Info", "module:Dom"
], function(Time, Objs, Types, Uri, Ids, Info, Dom) {
    return {

        getFlashObject: function(container) {
            container = Dom.unbox(container);
            var embed = container.getElementsByTagName("EMBED")[0];
            if (Info.isInternetExplorer() && Info.internetExplorerVersion() <= 10)
                embed = null;
            if (!embed)
                embed = container.getElementsByTagName("OBJECT")[0];
            if (!embed) {
                var objs = document.getElementsByTagName("OBJECT");
                for (var i = 0; i < objs.length; ++i)
                    if (container.contains(objs[i]))
                        embed = objs[i];
            }
            return embed;
        },

        embedTemplate: function(options) {
            options = options || {};
            var params = [];
            params.push({
                "objectKey": "classid",
                "value": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
            });
            params.push({
                "objectKey": "codebase",
                "value": "https://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab"
            });
            params.push({
                "embedKey": "align",
                "value": "middle"
            });
            params.push({
                "embedKey": "play",
                "value": "true"
            });
            params.push({
                "embedKey": "loop",
                "value": "false"
            });
            params.push({
                "embedKey": "type",
                "value": "application/x-shockwave-flash"
            });
            params.push({
                "embedKey": "pluginspage",
                "value": "https://get.adobe.com/flashplayer"
            });
            params.push({
                "objectParam": "quality",
                "embedKey": "quality",
                "value": "high"
            });
            params.push({
                "objectParam": "allowScriptAccess",
                "embedKey": "allowScriptAccess",
                "value": "always"
            });
            params.push({
                "objectParam": "wmode",
                "embedKey": "wmode",
                "value": "opaque"
            });
            params.push({
                "objectParam": "movie",
                "embedKey": "src",
                "value": options.flashFile + (options.forceReload ? "?" + Time.now() : "")
            });
            if (options.width) {
                params.push({
                    "objectKey": "width",
                    "embedKey": "width",
                    "value": options.width
                });
            }
            if (options.height) {
                params.push({
                    "objectKey": "height",
                    "embedKey": "height",
                    "value": options.height
                });
            }
            if (options.bgcolor) {
                params.push({
                    "objectParam": "bgcolor",
                    "embedKey": "bgcolor",
                    "value": options.bgcolor
                });
            }
            if (options.FlashVars) {
                params.push({
                    "objectParam": "FlashVars",
                    "embedKey": "FlashVars",
                    "value": Types.is_object(options.FlashVars) ? Uri.encodeUriParams(options.FlashVars) : options.FlashVars
                });
            }
            params.push({
                "objectKey": "id",
                "value": options.objectId || Ids.uniqueId("flash")
            });
            var objectKeys = [];
            var objectParams = [];
            var embedKeys = [];
            Objs.iter(params, function(param) {
                if (param.objectKey)
                    objectKeys.push(param.objectKey + '="' + param.value + '"');
                if (param.embedKey)
                    embedKeys.push(param.embedKey + '="' + param.value + '"');
                if (param.objectParam)
                    objectParams.push('<param name="' + param.objectParam + '" value="' + param.value + '" />');
            }, this);
            return "<object " + objectKeys.join(" ") + ">" + objectParams.join(" ") + "<embed " + embedKeys.join(" ") + "></embed></object>";
        },

        embedFlashObject: function(container, options) {
            container = Dom.unbox(container);
            options = options || {};
            if (options.parentBgcolor) {
                try {
                    var hex = container.style.backgroundColor || "";
                    if (hex.indexOf("rgb") >= 0) {
                        var rgb = hex.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                        var convert = function(x) {
                            return ("0" + parseInt(x, 10).toString(16)).slice(-2);
                        };
                        if (rgb && rgb.length > 3)
                            hex = "#" + convert(rgb[1]) + convert(rgb[2]) + convert(rgb[3]);
                    }
                    options.bgcolor = hex;
                } catch (e) {}
            }
            if (options.fixHalfPixels) {
                try {
                    var offset = Dom.elementOffset(container);
                    if (offset.top % 1 !== 0)
                        container.style.marginTop = (Math.round(offset.top) - offset.top) + "px";
                    if (offset.left % 1 !== 0)
                        container.style.marginLeft = (Math.round(offset.left) - offset.left) + "px";
                } catch (e) {}
            }
            container.innerHTML = this.embedTemplate(options);
            return this.getFlashObject(container);
        }

    };
});
/*
 * Uses modified portions of:
 * 
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */

Scoped.define("module:Hotkeys", [
    "base:Objs"
], function(Objs) {
    return {

        SHIFT_NUMS: {
            "`": "~",
            "1": "!",
            "2": "@",
            "3": "#",
            "4": "$",
            "5": "%",
            "6": "^",
            "7": "&",
            "8": "*",
            "9": "(",
            "0": ")",
            "-": "_",
            "=": "+",
            ";": ":",
            "'": "\"",
            ",": "<",
            ".": ">",
            "/": "?",
            "\\": "|"
        },

        SPECIAL_KEYS: {
            'esc': 27,
            'escape': 27,
            'tab': 9,
            'space': 32,
            'return': 13,
            'enter': 13,
            'backspace': 8,

            'scrolllock': 145,
            'scroll_lock': 145,
            'scroll': 145,
            'capslock': 20,
            'caps_lock': 20,
            'caps': 20,
            'numlock': 144,
            'num_lock': 144,
            'num': 144,

            'pause': 19,
            'break': 19,

            'insert': 45,
            'home': 36,
            'delete': 46,
            'end': 35,

            'pageup': 33,
            'page_up': 33,
            'pu': 33,

            'pagedown': 34,
            'page_down': 34,
            'pd': 34,

            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40,

            'f1': 112,
            'f2': 113,
            'f3': 114,
            'f4': 115,
            'f5': 116,
            'f6': 117,
            'f7': 118,
            'f8': 119,
            'f9': 120,
            'f10': 121,
            'f11': 122,
            'f12': 123
        },

        MODIFIERS: ["ctrl", "alt", "shift", "meta"],

        keyCodeToCharacter: function(code) {
            if (code == 188)
                return ",";
            else if (code == 190)
                return ".";
            return String.fromCharCode(code).toLowerCase();
        },

        handleKeyEvent: function(hotkey, e, options) {
            options = Objs.extend({
                "disable_in_input": false,
                "keycode": false
            }, options);
            var keys = hotkey.toLowerCase().split("+");
            if (options.disable_in_input) {
                var element = e.target || e.srcElement || null;
                if (element && element.nodeType == 3)
                    element = element.parentNode;
                if (element && (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA'))
                    return false;
            }
            var code = e.keyCode || e.which || 0;
            var character = this.keyCodeToCharacter(code);
            var kp = 0;
            var modifier_map = {};
            Objs.iter(this.MODIFIERS, function(mod) {
                modifier_map[mod] = {
                    pressed: e[mod + "Key"],
                    wanted: false
                };
            }, this);
            Objs.iter(keys, function(key) {
                if (key in modifier_map) {
                    modifier_map[key].wanted = true;
                    kp++;
                } else if (key.length > 1) {
                    if (this.SPECIAL_KEYS[key] == code)
                        kp++;
                } else if (options.keycode) {
                    if (options.keycode == code)
                        kp++;
                } else if (character == key || (e.shiftKey && this.SHIFT_NUMS[character] == key)) {
                    kp++;
                }
            }, this);
            /**
             * Allow to use use several keys for one action
             * @example: ba-hotkey:space^enter="function(){}"
             */
            var multipleKeys = hotkey.toLowerCase().split("^");
            if (multipleKeys.length > 1) {
                Objs.iter(multipleKeys, function(key) {
                    if (key.length > 1 && e.keyCode === this.SPECIAL_KEYS[key]) {
                        // Prevent browser scroll when press space
                        if (code === 32) e.preventDefault();

                        if (this.SPECIAL_KEYS[key] == code)
                            kp++;
                    }
                }, this);
            }
            return kp == keys.length && Objs.all(modifier_map, function(data) {
                return data.wanted == data.pressed;
            });
        },

        register: function(hotkey, callback, context, options) {
            options = Objs.extend({
                "type": "keyup",
                "propagate": false,
                "disable_in_input": false,
                "target": document,
                "keycode": false
            }, options);
            var self = this;
            var func = function(e) {
                if (self.handleKeyEvent(hotkey, e, options)) {
                    if (!options.propagate) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    callback.call(context || this, e);
                }
            };
            options.target.addEventListener(options.type, func, false);
            return {
                target: options.target,
                type: options.type,
                func: func
            };
        },

        unregister: function(handle) {
            handle.target.removeEventListener(handle.type, handle.func, false);
        }

    };
});
Scoped.define("module:Info", [
    "base:Objs", "module:FlashDetect"
], function(Objs, FlashDetect) {
    return {

        __navigator: null,

        getNavigator: function() {
            if (!this.__navigator) {
                this.__navigator = {
                    appCodeName: navigator.appCodeName,
                    appName: navigator.appName,
                    appVersion: navigator.appVersion,
                    cookieEnabled: navigator.cookieEnabled,
                    onLine: navigator.onLine,
                    platform: navigator.platform,
                    userAgent: navigator.userAgent,
                    window_chrome: (typeof window !== "undefined") && ("chrome" in window),
                    window_opera: (typeof window !== "undefined") && ("opera" in window),
                    language: navigator.language || navigator.userLanguage || "",
                    isTouchable: this.isTouchable()
                };
            }
            return this.__navigator;
        },

        __cache: {},

        __cached: function(key, value_func, force) {
            if (!(key in this.__cache) || force) {
                var n = this.getNavigator();
                this.__cache[key] = value_func.call(this, n, n.userAgent, n.userAgent.toLowerCase());
            }
            return this.__cache[key];
        },

        setNavigator: function(obj) {
            this.__navigator = obj;
            this.__cache = {};
        },

        language: function() {
            return this.__cached("language", function(nav) {
                return nav.language;
            });
        },

        flash: function(force) {
            return this.__cached("flash", function() {
                return new FlashDetect();
            }, force);
        },

        isiOS: function() {
            return this.__cached("isiOS", function(nav, ua) {
                if (this.isInternetExplorer() || this.isIEMobile())
                    return false;
                var strs = [ua];
                if (nav.platform)
                    strs.push(nav.platform);
                var ids = ["iPhone", "iPod", "iPad"];
                return strs.some(function(s) {
                    return ids.some(function(i) {
                        return s.indexOf(i) != -1;
                    });
                }) || (nav.platform && nav.platform === "MacIntel" && nav.isTouchable);
            });
        },

        isEdge: function() {
            return this.__cached("isEdge", function(nav, ua) {
                return ua.indexOf('Edge') != -1;
            });
        },

        isCordova: function() {
            return ((typeof window !== "undefined") && (!!window.cordova || !!window._cordovaNative)) || document.location.href.indexOf("file:///android_asset/www") === 0 || document.location.href.indexOf("file:///var/mobile/Containers/Bundle/Application") === 0;
        },

        isLocalCordova: function() {
            return this.__cached("isLocalCordova", function() {
                return this.isCordova() && document.location.href.indexOf("http") !== 0;
            });
        },

        isChrome: function() {
            return this.__cached("isChrome", function(nav, ua) {
                return (nav.window_chrome || ua.indexOf('CriOS') != -1) && !this.isOpera() && !this.isEdge();
            });
        },

        isChromium: function() {
            return this.__cached("isChromium", function(nav, ua, ualc) {
                return !this.isChrome() && this.isAndroid() && ualc.indexOf("linux") >= 0;
            });
        },

        isChromiumBased: function() {
            return this.__cached("isChromiumBased", function() {
                return this.isChrome() || this.isChromium();
            });
        },

        isOpera: function() {
            return this.__cached("isOpera", function(nav, ua) {
                return nav.window_opera || ua.indexOf(' OPR/') >= 0 || ua.indexOf("OPiOS") >= 0 || ua.indexOf('Opera') >= 0;
            });
        },

        isAndroid: function() {
            return this.__cached("isAndroid", function(nav, ua, ualc) {
                return ualc.indexOf("android") != -1;
            });
        },

        isWebOS: function() {
            return this.__cached("isWebOS", function(nav, ua, ualc) {
                return ualc.indexOf("webos") != -1;
            });
        },

        isWindowsPhone: function() {
            return this.__cached("isWindowsPhone", function(nav, ua, ualc) {
                return ualc.indexOf("windows phone") != -1;
            });
        },

        isBlackberry: function() {
            return this.__cached("isBlackberry", function(nav, ua, ualc) {
                return ualc.indexOf("blackberry") != -1;
            });
        },

        iOSversion: function() {
            return this.__cached("iOSversion", function(nav) {
                if (!this.isiOS())
                    return false;
                var v = (nav.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                return {
                    major: parseInt(v[1], 10),
                    minor: parseInt(v[2], 10),
                    revision: parseInt(v[3] || 0, 10)
                };
            });
        },

        androidVersion: function() {
            return this.__cached("androidVersion", function(nav) {
                if (!this.isAndroid())
                    return false;
                var v = (nav.userAgent).match(/Android (\d+)\.(\d+)\.?(\d+)?/);
                return {
                    major: parseInt(v[1], 10),
                    minor: parseInt(v[2], 10),
                    revision: parseInt(v[3] || 0, 10)
                };
            });
        },

        isMobile: function() {
            return this.__cached("isMobile", function() {
                return this.isiOS() || this.isAndroid() || this.isWebOS() || this.isWindowsPhone() || this.isBlackberry();
            });
        },

        isDesktop: function() {
            return this.__cached("isDesktop", function() {
                return !this.isMobile();
            });
        },

        isInternetExplorer: function() {
            return this.__cached("isInternetExplorer", function() {
                //return navigator.appName == 'Microsoft Internet Explorer';
                return !this.isIEMobile() && this.internetExplorerVersion() !== null;
            });
        },

        isIEMobile: function() {
            return this.__cached("isIEMobile", function(nav, ua, ualc) {
                return ualc.indexOf("iemobile") >= 0;
            });
        },

        isFirefox: function() {
            return this.__cached("isFirefox", function(nav, ua, ualc) {
                if (ualc.indexOf("firefox") != -1 || ualc.indexOf("fxios") != -1)
                    return true;
                return false;
            });
        },

        isSafari: function() {
            return this.__cached("isSafari", function(nav, ua, ualc) {
                if (!this.isChrome() && !this.isOpera() && !this.isEdge() && !this.isFirefox() && ualc.indexOf("safari") != -1 && !this.isAndroid())
                    return true;
                if (this.isiOS() && ua.indexOf("Macintosh") != -1 && nav.platform) {
                    if (nav.platform === "iPad")
                        return true;
                    if (nav.isTouchable && nav.platform === "MacIntel")
                        return true;
                }
                return false;
            });
        },

        isWindows: function() {
            return this.__cached("isWindows", function(nav) {
                return nav.appVersion.toLowerCase().indexOf("win") != -1 && !this.isWindowsPhone();
            });
        },

        isMacOS: function() {
            return this.__cached("isMacOS", function(nav) {
                return !this.isiOS() && nav.appVersion.toLowerCase().indexOf("mac") != -1;
            });
        },

        isUnix: function() {
            return this.__cached("isUnix", function(nav) {
                return nav.appVersion.toLowerCase().indexOf("x11") != -1;
            });
        },

        isLinux: function() {
            return this.__cached("isLinux", function(nav) {
                return !this.isAndroid() && nav.appVersion.toLowerCase().indexOf("linux") != -1;
            });
        },

        /**
         * Checking if device is touchable device
         *
         * @return {boolean}
         */
        isTouchable: function() {
            return (((typeof window !== "undefined") && ('ontouchstart' in window)) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        },

        /**
         * Will return boolean if screen recorder is supported
         * We have the same method in betajs-media package, but sometimes it could be required before
         * recorder is initialized
         * @return {boolean}
         */
        isScreenRecorderSupported: function() {
            if (typeof navigator.mediaDevices !== 'undefined') {
                if ((this.isChrome() || this.isFirefox() || this.isOpera() || this.isEdge()) && !this.isMobile() && typeof navigator.mediaDevices.getDisplayMedia !== 'undefined')
                    return true;
            }
            return false;
        },


        internetExplorerVersion: function() {
            return this.__cached("internetExplorerVersion", function(nav, ua) {
                if (nav.appName == 'Microsoft Internet Explorer') {
                    var re = new RegExp("MSIE ([0-9]+)");
                    var ma = re.exec(ua);
                    if (ma)
                        return ma[1];
                } else if (nav.appName == 'Netscape') {
                    var re2 = new RegExp("Trident/.*rv:([0-9]+)");
                    var ma2 = re2.exec(nav.userAgent);
                    if (ma2)
                        return parseFloat(ma2[1]);
                }
                return null;
            });
        },

        chromeVersion: function() {
            return this.__cached("chromeVersion", function(nav, ua) {
                var re = /(Chrome|CriOS)\/(\d+\.\d+)[^\d]/gi;
                var ma = re.exec(ua);
                if (ma)
                    return parseFloat(ma[2]);
                return null;
            });
        },

        operaVersion: function() {
            return this.__cached("operaVersion", function(nav, ua) {
                var re = /OPR\/(\d+\.\d+)[^\d]/gi;
                var ma = re.exec(ua);
                if (ma)
                    return parseFloat(ma[1]);
                return null;
            });
        },

        safariVersion: function() {
            return this.__cached("safariVersion", function(nav, ua) {
                var re = /Version\/(\d+\.\d+)[^\d]/gi;
                var ma = re.exec(ua);
                if (ma)
                    return parseFloat(ma[1]);
                return null;
            });
        },

        firefoxVersion: function() {
            return this.__cached("firefoxVersion", function(nav, ua) {
                var re = /Firefox\/(\d+\.\d+)/gi;
                var ma = re.exec(ua);
                if (ma)
                    return parseFloat(ma[1]);
                return null;
            });
        },

        edgeVersion: function() {
            return this.__cached("edgeVersion", function(nav, ua) {
                // Edge for the old versions latest was 15, Edg is for Chromium based version
                var re = /Edg\/(\d+\.\d+)|Edge\/(\d+\.\d+)/gi;
                var ma = re.exec(ua);
                if (ma)
                    return parseFloat(ma[1]);
                return null;
            });
        },

        inIframe: function() {
            try {
                return (typeof window !== "undefined") && (window.self !== window.top);
            } catch (e) {
                return true;
            }
        },

        __devicesMap: {
            mobile: {
                format: "Mobile",
                check: function() {
                    return this.isMobile();
                }
            },
            desktop: {
                format: "Desktop",
                check: function() {
                    return this.isDesktop();
                }
            }
        },

        __obtainMatch: function(map, def) {
            var result = null;
            Objs.iter(map, function(value, key) {
                if (value.check.apply(this)) {
                    if (result) {
                        result = null;
                        return false;
                    }
                    result = Objs.clone(value, 1);
                    delete result.check;
                    result.key = key;
                }
            }, this);
            return result || def;
        },

        getDevice: function() {
            return this.__cached("getDevice", function() {
                return this.__obtainMatch(this.__devicesMap, {
                    key: "unknown",
                    format: "Unknown Device"
                });
            });
        },

        formatDevice: function() {
            return this.getDevice().format;
        },

        __osMap: {
            macosx: {
                format: "Mac OS-X",
                check: function() {
                    return this.isMacOS();
                }
            },
            windows: {
                format: "Windows",
                check: function() {
                    return this.isWindows();
                }
            },
            unix: {
                format: "Unix",
                check: function() {
                    return this.isUnix();
                }
            },
            linux: {
                format: "Linux",
                check: function() {
                    return this.isLinux();
                }
            },
            ios: {
                format: "iOS",
                check: function() {
                    return this.isiOS();
                },
                version: function() {
                    return this.iOSversion().major + "." + this.iOSversion().minor + "." + this.iOSversion().revision;
                }
            },
            android: {
                format: "Android",
                check: function() {
                    return this.isAndroid();
                }
            },
            webos: {
                format: "WebOS",
                check: function() {
                    return this.isWebOS();
                }
            },
            windowsphone: {
                format: "Windows Phone",
                check: function() {
                    return this.isWindowsPhone();
                }
            },
            blackberry: {
                format: "Blackberry",
                check: function() {
                    return this.isBlackberry();
                }
            }
        },

        getOS: function() {
            return this.__cached("getOS", function() {
                return this.__obtainMatch(this.__osMap, {
                    key: "unknown",
                    format: "Unknown Operating System"
                });
            });
        },

        formatOS: function() {
            return this.getOS().format;
        },

        formatOSVersion: function() {
            return this.getOS().version ? this.getOS().version.apply(this) : "";
        },

        __browserMap: {
            chrome: {
                format: "Chrome",
                check: function() {
                    return this.isChrome();
                },
                version: function() {
                    return this.chromeVersion();
                }
            },
            chromium: {
                format: "Chromium",
                check: function() {
                    return this.isChromium();
                }
            },
            opera: {
                format: "Opera",
                check: function() {
                    return this.isOpera();
                },
                version: function() {
                    return this.operaVersion();
                }
            },
            internetexplorer: {
                format: "Internet Explorer",
                check: function() {
                    return this.isInternetExplorer();
                },
                version: function() {
                    return this.internetExplorerVersion();
                }
            },
            firefox: {
                format: "Firefox",
                check: function() {
                    return this.isFirefox();
                },
                version: function() {
                    return this.firefoxVersion();
                }
            },
            safari: {
                format: "Safari",
                check: function() {
                    return this.isSafari();
                },
                version: function() {
                    return this.safariVersion();
                }
            },
            webos: {
                format: "WebOS",
                check: function() {
                    return this.isWebOS();
                }
            },
            blackberry: {
                format: "Blackberry",
                check: function() {
                    return this.isBlackberry();
                }
            },
            edge: {
                format: "Edge",
                check: function() {
                    return this.isEdge();
                }
            },
            iemobile: {
                format: "IE Mobile",
                check: function() {
                    return this.isIEMobile();
                }
            }
        },

        getBrowser: function() {
            return this.__cached("getBrowser", function() {
                return this.__obtainMatch(this.__browserMap, {
                    key: "unknown",
                    format: "Unknown Browser"
                });
            });
        },

        formatBrowser: function() {
            return this.getBrowser().format;
        },

        formatBrowserVersion: function() {
            return this.getBrowser().version ? this.getBrowser().version.apply(this) : "";
        },

        formatFlash: function() {
            return this.flash().installed() ?
                ("Flash " + this.flash().version().raw) :
                (this.flash().supported() ?
                    "Flash not installed but supported" :
                    "Flash not supported");
        }

    };
});
Scoped.define("module:Loader", [
    "base:Ajax.Support",
    "module:Info"
], function(AjaxSupport, Info) {
    return {

        loadScript: function(url, callback, context) {
            var executed = false;
            var head = document.getElementsByTagName("head")[0];
            var script = document.createElement("script");
            script.src = url;
            script.onload = script.onreadystatechange = function() {
                if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                    executed = true;
                    script.onload = script.onreadystatechange = null;
                    if (callback)
                        callback.call(context || this, url);
                    // Does not work properly if we remove the script for some reason if it is used the second time !?
                    //head.removeChild(script);
                }
            };
            head.appendChild(script);
        },

        loadStyles: function(url, callback, context) {
            var executed = false;
            var head = document.getElementsByTagName("head")[0];
            var style = document.createElement("link");
            style.rel = "stylesheet";
            style.href = url;
            style.onload = style.onreadystatechange = function() {
                if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                    executed = true;
                    style.onload = style.onreadystatechange = null;
                    if (callback)
                        callback.call(context || this, url);
                }
            };
            head.appendChild(style);
        },

        inlineStyles: function(styles) {
            var head = document.getElementsByTagName("head")[0];
            var style = document.createElement("style");
            if (Info.isInternetExplorer() && Info.internetExplorerVersion() < 9) {
                style.setAttribute('type', 'text/css');
                style.styleSheet.cssText = styles;
            } else
                style.textContent = styles;
            head.appendChild(style);
            return style;
        },

        loadHtml: function(uri, callback, context) {
            AjaxSupport.execute({
                uri: uri,
                decodeType: "html"
            }).success(function(content) {
                callback.call(this, content, uri);
            }, context);
        },

        findScript: function(substr) {
            for (var i = 0; i < document.scripts.length; ++i)
                if (document.scripts[i].src.toLowerCase().indexOf(substr.toLowerCase()) >= 0)
                    return document.scripts[i];
            return null;
        },

        loadByIframe: function(options, callback, context) {
            var iframe = document.createElement("iframe");
            if (options.visible) {
                iframe.style.border = "none";
                iframe.style.width = "1px";
                iframe.style.height = "1px";
            } else {
                iframe.style.display = "none";
            }
            var loaded = function() {
                var body = null;
                var content = null;
                try {
                    body = iframe.contentDocument.body;
                    content = body.textContent || body.innerText;
                } catch (e) {}
                callback.call(context || this, content, body, iframe);
                if (options.remove)
                    document.body.removeChild(iframe);
            };
            if (iframe.attachEvent)
                iframe.attachEvent("onload", loaded);
            else
                iframe.onload = loaded;
            iframe.src = options.url;
            document.body.appendChild(iframe);
        }

    };
});
Scoped.define("module:HashRouteBinder", [
    "base:Router.RouteBinder",
    "module:Events"
], function(RouteBinder, Events, scoped) {
    return RouteBinder.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(router) {
                inherited.constructor.call(this, router);
                var events = this.auto_destroy(new Events());
                events.on(window, "hashchange", function() {
                    this._localRouteChanged();
                }, this);
            },

            _getLocalRoute: function() {
                var hash = window.location.hash;
                return (hash.length && hash[0] == '#') ? hash.slice(1) : hash;
            },

            _setLocalRoute: function(currentRoute) {
                window.location.hash = "#" + currentRoute.route;
            }

        };
    });
});


Scoped.define("module:HistoryRouteBinder", [
    "base:Router.RouteBinder",
    "module:Events"
], function(RouteBinder, Events, scoped) {
    return RouteBinder.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            __used: false,

            constructor: function(router) {
                inherited.constructor.call(this, router);
                var events = this.auto_destroy(new Events());
                events.on(window, "hashchange", function() {
                    if (this.__used)
                        this._localRouteChanged();
                }, this);
            },

            _getLocalRoute: function() {
                return window.location.pathname;
            },

            _setLocalRoute: function(currentRoute) {
                window.history.pushState({}, document.title, currentRoute.route);
                this.__used = true;
            }

        };
    }, {
        supported: function() {
            return window.history && window.history.pushState;
        }
    });
});


Scoped.define("module:LocationRouteBinder", [
    "base:Router.RouteBinder"
], function(RouteBinder, scoped) {
    return RouteBinder.extend({
        scoped: scoped
    }, {

        _getLocalRoute: function() {
            return window.location.pathname;
        },

        _setLocalRoute: function(currentRoute) {
            window.location.pathname = currentRoute.route;
        }

    });
});
Scoped.define("module:DomExtend.DomExtension", [
    "base:Class",
    "base:Objs",
    "base:Functions",
    "base:Async",
    "module:Dom",
    "module:DomMutation.NodeRemoveObserver",
    "module:DomMutation.NodeResizeObserver"
], function(Class, Objs, Functions, Async, Dom, NodeRemoveObserver, NodeResizeObserver, scoped) {
    return Class.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            _domMethods: [],
            _domAttrs: {},

            constructor: function(element, attrs) {
                inherited.constructor.call(this);
                this._element = Dom.unbox(element);
                this._element.domExtension = this;
                this._actualBB = null;
                this._idealBB = null;
                this._attrs = attrs || {};
                Objs.iter(this._domMethods, function(method) {
                    this._element[method] = Functions.as_method(this[method], this);
                }, this);
                Objs.iter(['get', 'set'], function(method) {
                    this._element[method] = Functions.as_method(this[method], this);
                }, this);
                Async.eventually(function() {
                    this._nodeRemoveObserver = this.auto_destroy(new NodeRemoveObserver(this._element));
                    this._nodeRemoveObserver.on("node-removed", this.weakDestroy, this);
                    this._nodeResizeObserver = this.auto_destroy(new NodeResizeObserver(this._element));
                    this._nodeResizeObserver.on("node-resized", function() {
                        this.recomputeBB();
                        this._notify("resized");
                    }, this);
                }, this);
                if (!this._element.style.display || this._element.style.display == "inline")
                    this._element.style.display = "inline-block";
            },

            domEvent: function(eventName) {
                Dom.triggerDomEvent(this._element, eventName);
            },

            readAttr: function(key) {
                return key in this._element.attributes ? this._element.attributes[key].value : (key in this._element ? this._element[key] : this._attrs[key]);
            },

            hasAttr: function(key) {
                return key in this._element.attributes || key in this._element || key in this._attrs;
            },

            writeAttr: function(key, value) {
                if (key in this._element.attributes)
                    this._element.attributes[key].value = value;
                else if (key in this._element)
                    this._element[key] = value;
                else
                    this._attrs[key] = value;
            },

            unsetAttr: function(key) {
                delete this._element[key];
                this._element.removeAttribute(key);
                delete this._attrs[key];
            },

            get: function(key) {
                var meta = this._domAttrs[key] || {};
                if (!(meta.get))
                    return this.readAttr(key);
                var value = Functions.callWithin(this, meta.get);
                this.writeAttr(key, value);
                return value;
            },

            set: function(key, value) {
                this.writeAttr(key, value);
                var meta = this._domAttrs[key] || {};
                if (meta.set)
                    Functions.callWithin(this, meta.set, value);
            },

            computeActualBB: function(idealBB) {
                var width = Dom.elementDimensions(this._element).width;
                //var height = Dom.elementDimensions(this._element).height;
                if (width < idealBB.width && !this._element.style.width) {
                    this._element.style.width = idealBB.width + "px";
                    width = Dom.elementDimensions(this._element).width;
                    var current = this._element;
                    while (current != document.body) {
                        current = current.parentNode;
                        width = Math.min(width, Dom.elementDimensions(current).width);
                    }
                    this._element.style.width = null;
                }
                /*
                if (height < idealBB.height && !this._element.style.height) {
                	this._element.style.height = idealBB.height + "px";
                	height = Dom.elementDimensions(this._element).height;
                	var current = this._element;
                	while (current != document) {
                		current = current.parentNode;
                		height = Math.min(height, Dom.elementDimensions(current).height);
                	}
                	this._element.style.height = null;
                }
                var arWidth = Math.round(height * idealBB.width / idealBB.height);
                var arHeight = Math.round(width * idealBB.height / idealBB.width);
                return {
                	width: Math.min(width, arWidth),
                	height: Math.min(height, arHeight)
                };
                */
                return {
                    width: width,
                    height: width * idealBB.height / idealBB.width
                };
            },

            idealBB: function() {
                return null;
            },

            recomputeBB: function() {
                var idealBB = this.idealBB();
                if (!idealBB)
                    return;
                var actualBB = this.computeActualBB(idealBB);
                this._idealBB = idealBB;
                this._actualBB = actualBB;
                this.setActualBB(actualBB);
            },

            setActualBB: function(actualBB) {}

        };
    });
});
Scoped.define("module:DomMutation.NodeRemoveObserver", [
    "base:Classes.ConditionalInstance",
    "base:Events.EventsMixin"
], function(ConditionalInstance, EventsMixin, scoped) {
    return ConditionalInstance.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this);
                this._node = node;
            },

            _nodeRemoved: function(node) {
                if (node !== this._node)
                    return;
                this.trigger("node-removed");
            }

        };
    }]);
});



Scoped.define("module:DomMutation.MutationObserverNodeRemoveObserver", [
    "module:DomMutation.NodeRemoveObserver",
    "base:Objs"
], function(Observer, Objs, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this, node);
                var self = this;
                this._observer = new window.MutationObserver(function(mutations) {
                    Objs.iter(mutations, function(mutation) {
                        for (var i = 0; i < mutation.removedNodes.length; ++i)
                            self._nodeRemoved(mutation.removedNodes[i]);
                    });
                });
                this._observer.observe(node.parentNode, {
                    childList: true
                });
            },

            destroy: function() {
                this._observer.disconnect();
                inherited.destroy.call(this);
            }

        };
    }, {

        supported: function(node) {
            try {
                return !!window.MutationObserver;
            } catch (e) {
                return false;
            }
        }

    });
});



Scoped.define("module:DomMutation.DOMNodeRemovedNodeRemoveObserver", [
    "module:DomMutation.NodeRemoveObserver",
    "module:Info",
    "module:Events"
], function(Observer, Info, Events, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this, node);
                var events = this.auto_destroy(new Events());
                events.on(document, "DOMNodeRemoved", function(event) {
                    this._nodeRemoved(event.target);
                }, this);
            }

        };
    }, {

        supported: function(node) {
            return !Info.isInternetExplorer() || Info.internetExplorerVersion() >= 9;
        }

    });

});



Scoped.define("module:DomMutation.TimerNodeRemoveObserver", [
    "module:DomMutation.NodeRemoveObserver",
    "base:Timers.Timer"
], function(Observer, Timer, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this, node);
                this._timer = new Timer({
                    context: this,
                    fire: this._fire,
                    delay: 100
                });
            },

            destroy: function() {
                this._timer.weakDestroy();
                inherited.destroy.call(this);
            },

            _fire: function() {
                if (!this._node.parentElement) {
                    this._timer.stop();
                    this._nodeRemoved(this._node);
                }
            }

        };
    }, {

        supported: function(node) {
            return true;
        }

    });

});

Scoped.extend("module:DomMutation.NodeRemoveObserver", [
    "module:DomMutation.NodeRemoveObserver",
    "module:DomMutation.MutationObserverNodeRemoveObserver",
    "module:DomMutation.DOMNodeRemovedNodeRemoveObserver",
    "module:DomMutation.TimerNodeRemoveObserver"
], function(Observer, MutationObserverNodeRemoveObserver, DOMNodeRemovedNodeRemoveObserver, TimerNodeRemoveObserver) {
    Observer.register(MutationObserverNodeRemoveObserver, 3);
    Observer.register(DOMNodeRemovedNodeRemoveObserver, 2);
    Observer.register(TimerNodeRemoveObserver, 1);
    return {};
});


Scoped.define("module:DomMutation.NodeResizeObserver", [
    "base:Class",
    "base:Events.EventsMixin",
    "module:Events"
], function(Class, EventsMixin, Events, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this);
                var events = this.auto_destroy(new Events());
                events.on(window, "resize", function(event) {
                    this._resized();
                }, this);
            },

            _resized: function() {
                this.trigger("node-resized");
            }

        };
    }]);
});


Scoped.define("module:DomMutation.NodeInsertObserver", [
    "base:Classes.ConditionalInstance",
    "base:Events.EventsMixin"
], function(ConditionalInstance, EventsMixin, scoped) {
    return ConditionalInstance.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        return {

            _nodeInserted: function(node, expand) {
                if (expand) {
                    for (var i = 0; i < node.childNodes.length; ++i)
                        this._nodeInserted(node.childNodes[i], expand);
                }
                if (this._options.parent && node.parentNode !== this._options.parent)
                    return;
                if (this._options.root && !this._options.root.contains(node))
                    return;
                if (this._options.filter && !this._options.filter.call(this._options.context || this, node))
                    return;
                this.trigger("node-inserted", node);
            }

        };
    }]);
});


Scoped.define("module:DomMutation.MutationObserverNodeInsertObserver", [
    "module:DomMutation.NodeInsertObserver",
    "base:Objs"
], function(Observer, Objs, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                options = options || {};
                inherited.constructor.call(this, options);
                var self = this;
                this._observer = new window.MutationObserver(function(mutations) {
                    Objs.iter(mutations, function(mutation) {
                        for (var i = 0; i < mutation.addedNodes.length; ++i)
                            self._nodeInserted(mutation.addedNodes[i], true);
                    });
                });
                this._observer.observe(this._options.root || this._options.parent || document.body, {
                    childList: true,
                    subtree: !this._options.parent
                });
            },

            destroy: function() {
                this._observer.disconnect();
                inherited.destroy.call(this);
            }

        };
    }, {

        supported: function(node) {
            try {
                return !!window.MutationObserver;
            } catch (e) {
                return false;
            }
        }

    });
});



Scoped.define("module:DomMutation.DOMNodeInsertedNodeInsertObserver", [
    "module:DomMutation.NodeInsertObserver",
    "module:Events"
], function(Observer, Events, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                options = options || {};
                inherited.constructor.call(this, options);
                var events = this.auto_destroy(new Events());
                events.on(document, "DOMNodeInserted", function(event) {
                    this._nodeInserted(event.target, true);
                }, this);
            }

        };
    }, {

        supported: function(node) {
            return true;
        }

    });
});


Scoped.extend("module:DomMutation.NodeInsertObserver", [
    "module:DomMutation.NodeInsertObserver",
    "module:DomMutation.MutationObserverNodeInsertObserver",
    "module:DomMutation.DOMNodeInsertedNodeInsertObserver"
], function(Observer, MutationObserverNodeInsertObserver, DOMNodeInsertedNodeInsertObserver) {
    Observer.register(MutationObserverNodeInsertObserver, 3);
    Observer.register(DOMNodeInsertedNodeInsertObserver, 2);
    return {};
});
Scoped.define("module:Dom", [
    "base:Types",
    "base:Objs",
    "module:Info",
    "base:Async"
], function(Types, Objs, Info, Async) {

    var TEMPLATE_TAG_MAP = {
        "tr": ["table", "tbody"],
        "td": ["table", "tbody", "tr"],
        "th": ["table", "thead", "tr"]
    };

    var INTERACTION_EVENTS = ["click", "mousedown", "mouseup", "touchstart", "touchend", "keydown", "keyup", "keypress"];

    var userInteractionCallbackList = [];
    var userInteractionCallbackWaiting = false;
    var userInteractionCallbackFunc = function() {
        userInteractionCallbackList.forEach(function(entry) {
            entry.callback.call(entry.context || this);
        });
        userInteractionCallbackList = [];
        userInteractionCallbackWaiting = false;
        INTERACTION_EVENTS.forEach(function(event) {
            window.removeEventListener(event, userInteractionCallbackFunc);
        });
    };

    var Dom = {

        ready: function(callback, context) {
            if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
                Async.eventually(callback, context);
            } else {
                var completed;
                var done = false;
                var timer = null;
                completed = function() {
                    clearInterval(timer);
                    document.removeEventListener("DOMContentLoaded", completed);
                    window.removeEventListener("load", completed);
                    if (done)
                        return;
                    done = true;
                    callback.apply(context || this);
                };
                document.addEventListener("DOMContentLoaded", completed);
                window.addEventListener("load", completed);
                timer = setInterval(function() {
                    if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll))
                        completed();
                }, 10);
            }
        },

        userInteraction: function(callback, context) {
            userInteractionCallbackList.push({
                callback: callback,
                context: context
            });
            if (!userInteractionCallbackWaiting) {
                userInteractionCallbackWaiting = true;
                INTERACTION_EVENTS.forEach(function(event) {
                    window.addEventListener(event, userInteractionCallbackFunc);
                });
            }
        },

        isTabHidden: function() {
            return document.hidden || document.webkitHidden || document.mozHidden || document.msHidden;
        },

        elementsByTemplate: function(template) {
            template = template.trim();
            var polyfill = Info.isInternetExplorer() && Info.internetExplorerVersion() < 9;
            /*
             * TODO: This is probably not a good fix.
             *
             * Some tags, like tr, are not generated by the browser when under a generic tag like div.
             * In other words
             *
             * <div>.innerHTML = "<tr><p>foo</p></tr>" will become <div><p>foo</p></div>
             *
             * The quick fix here checks for an outer tag and picks the proper temporary parent tag.
             *
             * This needs to be fixed properly in the future.
             */
            var parentTags = [];
            Objs.iter(TEMPLATE_TAG_MAP, function(value, key) {
                if (template.indexOf("<" + key) === 0) {
                    parentTags = value;
                    polyfill = false;
                }
            });
            var outerTemplate = [
                parentTags.map(function(t) {
                    return "<" + t + ">";
                }).join(""),
                polyfill ? "<br/>" : "",
                template,
                parentTags.map(function(t) {
                    return "</" + t + ">";
                }).join("")
            ].join("");
            var element = document.createElement("div");
            element.innerHTML = outerTemplate;
            parentTags.forEach(function() {
                element = element.children[0];
            });
            var result = [];
            for (var i = polyfill ? 1 : 0; i < element.children.length; ++i)
                result.push(element.children[i]);
            if (polyfill) {
                result = result.filter(function(el) {
                    return !(el.tagName.indexOf("/") === 0 && template.toLowerCase().indexOf("<" + el.tagName.toLowerCase()) >= 0);
                });
            }
            return result;
        },

        elementByTemplate: function(template, encapsulate_in_div_if_needed) {
            var result = this.elementsByTemplate(template);
            if (result.length === 1)
                return result[0];
            if (result.length === 0 || !encapsulate_in_div_if_needed)
                return null;
            var element = document.createElement("div");
            result.forEach(element.appendChild, element);
            return element;
        },

        changeTag: function(node, name) {
            var replacement = document.createElement(name);
            for (var i = 0; i < node.attributes.length; ++i) {
                var attr = node.attributes[i];
                replacement.setAttribute(attr.nodeName, "value" in attr ? attr.value : attr.nodeValue);
            }
            while (node.firstChild)
                replacement.appendChild(node.firstChild);
            if (node.parentNode)
                node.parentNode.replaceChild(replacement, node);
            return replacement;
        },

        traverseNext: function(node, skip_children) {
            node = this.unbox(node);
            if (node.firstChild && !skip_children)
                return node.firstChild;
            if (!node.parentNode)
                return null;
            if (node.nextSibling)
                return node.nextSibling;
            return this.traverseNext(node.parentNode, true);
        },

        splitNode: function(node, start_offset, end_offset) {
            start_offset = start_offset || 0;
            end_offset = end_offset || (node.wholeText ? node.wholeText.length : 0);
            if (end_offset < (node.wholeText ? node.wholeText.length : 0))
                node.splitText(end_offset);
            if (start_offset > 0)
                node = node.splitText(start_offset);
            return node;
        },

        __FULLSCREEN_EVENTS: ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"],
        __FULLSCREEN_METHODS: ["requestFullscreen", "webkitRequestFullscreen", "mozRequestFullScreen", "msRequestFullscreen", "webkitEnterFullScreen"],
        __FULLSCREEN_ATTRS: ["fullscreenElement", "webkitFullscreenElement", "mozFullScreenElement", "msFullscreenElement"],
        __FULLSCREEN_EXIT_METHODS: ["exitFullscreen", "mozCancelFullScreen", "webkitExitFullscreen", "msExitFullscreen"],

        elementSupportsFullscreen: function(element) {
            return element && this.__FULLSCREEN_METHODS.some(function(key) {
                return key in element;
            });
        },

        elementEnterFullscreen: function(element) {
            var done = false;
            this.__FULLSCREEN_METHODS.forEach(function(key) {
                if (!done && (key in element)) {
                    element[key].call(element);
                    done = true;
                }
            });
        },

        // Will exit from document's full screen mode
        documentExitFullscreen: function() {
            this.__FULLSCREEN_EXIT_METHODS.forEach(function(key) {
                if (document[key]) {
                    document[key]();
                }
            });
        },

        elementIsFullscreen: function(element) {
            return this.__FULLSCREEN_ATTRS.some(function(key) {
                return document[key] === element;
            });
        },

        elementOnFullscreenChange: function(element, callback, context) {
            var self = this;
            var listener = function() {
                callback.call(context || this, element, self.elementIsFullscreen(element));
            };
            this.__FULLSCREEN_EVENTS.forEach(function(event) {
                element.addEventListener(event, listener, false);
            });
            return listener;
        },

        elementOffFullscreenChange: function(element, listener) {
            this.__FULLSCREEN_EVENTS.forEach(function(event) {
                element.removeEventListener(event, listener, false);
            });
        },
        __PIP_EVENTS: ["enterpictureinpicture", "leavepictureinpicture"],
        /**
         * If browser supports picture-in-picture
         *
         * INFO: to enable PIP in FF: about:config, set media.videocontrols.picture-in-picture.enabled,
         * media.videocontrols.picture-in-picture.video-toggle.enabled;true
         * and media.videocontrols.picture-in-picture.video-toggle.flyout-enabled
         *
         * @param {HTMLVideoElement =} videoElement
         * @returns {boolean}
         */
        browserSupportsPIP: function(videoElement) {
            videoElement = videoElement || HTMLVideoElement.prototype || {};

            if ('pictureInPictureEnabled' in document)
                return true;

            if (Info.isMacOS() && Info.safariVersion() >= 9)
                return !!(videoElement.webkitSupportsPresentationMode && typeof videoElement.webkitSetPresentationMode === "function");

            return false;
        },

        /**
         *
         * @param {HTMLVideoElement} videoElement
         */
        videoElementEnterPIPMode: function(videoElement) {
            if (!videoElement || !(videoElement instanceof HTMLVideoElement))
                return;
            videoElement = videoElement || HTMLVideoElement.prototype || {};

            if ('pictureInPictureElement' in document) {
                if (!document.pictureInPictureElement && typeof videoElement.requestPictureInPicture === 'function') {
                    try {
                        videoElement.requestPictureInPicture();
                    } catch (err) {
                        console.warn(err);
                    }
                }
            }

            if (Info.isMacOS() && Info.safariVersion() >= 9 && typeof videoElement.webkitSetPresentationMode === 'function')
                videoElement.webkitSetPresentationMode("picture-in-picture");
        },

        /**
         * Video Will Exit From PIP Mode
         * @param {HTMLVideoElement} videoElement
         */
        videoElementExitPIPMode: function(videoElement) {
            videoElement = videoElement || HTMLVideoElement.prototype || {};

            if ('pictureInPictureElement' in document) {
                if (document.pictureInPictureElement && typeof document.exitPictureInPicture === 'function') {
                    try {
                        document.exitPictureInPicture();
                    } catch (err) {
                        console.warn(err);
                    }
                }
            }

            if (Info.isMacOS() && Info.safariVersion() >= 9 && typeof videoElement.webkitSetPresentationMode === 'function') {
                videoElement.webkitSetPresentationMode('inline');
            }
        },

        /**
         * Will check if Video Element in PIP Mode
         * @param {HTMLVideoElement} videoElement
         * @returns {boolean}
         */
        videoIsInPIPMode: function(videoElement) {
            if ('pictureInPictureElement' in document)
                return !!document.pictureInPictureElement;

            if (Info.isMacOS() && Info.safariVersion() >= 9)
                return (videoElement.webkitPresentationMode === "picture-in-picture");

        },

        /**
         *
         * @param {HTMLVideoElement} videoElement
         * @param {function} callback
         * @param {object =} context
         * @returns {listener | null}
         */
        videoAddPIPChangeListeners: function(videoElement, callback, context) {
            if (!videoElement || !(videoElement instanceof HTMLVideoElement))
                return null;

            var self = this;
            var listener = function() {
                callback.call(context || this, videoElement, self.videoIsInPIPMode(videoElement));
            };
            this.__PIP_EVENTS.forEach(function(event) {
                videoElement.addEventListener(event, listener, false);
            });
            return listener;
        },

        /**
         *
         * @param {HTMLVideoElement} videoElement
         * @param {function} callback
         * @param {object =} context
         * @returns {listener}
         */
        videoRemovePIPChangeListeners: function(videoElement) {
            if (!videoElement || !(videoElement instanceof HTMLVideoElement))
                return null;

            this.__PIP_EVENTS.forEach(function(event) {
                videoElement.removeEventListener(event, videoElement);
            });
        },

        entitiesToUnicode: function(s) {
            if (!s || !Types.is_string(s) || s.indexOf("&") < 0)
                return s;
            return s.split(">").map(function(s) {
                return s.split("<").map(function(s) {
                    var temp = document.createElement("span");
                    temp.innerHTML = s;
                    s = temp.textContent || temp.innerText;
                    if (temp.remove)
                        temp.remove();
                    return s;
                }).join("<");
            }).join(">");
        },

        unbox: function(element) {
            if (Types.is_string(element))
                element = document.querySelector(element);
            return !element || element.nodeType ? element : element.get(0);
        },

        triggerDomEvent: function(element, eventName, parameters, customEventParams) {
            element = this.unbox(element);
            eventName = eventName.toLowerCase();
            var onEvent = "on" + eventName;
            var onEventHandler = null;
            var onEventCalled = false;
            if (element[onEvent]) {
                onEventHandler = element[onEvent];
                element[onEvent] = function() {
                    if (onEventCalled)
                        return;
                    onEventCalled = true;
                    onEventHandler.apply(this, arguments);
                };
            }
            try {
                var event;
                try {
                    if (customEventParams)
                        event = new CustomEvent(eventName, customEventParams);
                    else
                        event = new Event(eventName);
                } catch (e) {
                    try {
                        if (customEventParams) {
                            event = document.createEvent('CustomEvent');
                            event.initCustomEvent(eventName, customEventParams.bubbles || false, customEventParams.cancelable || false, customEventParams.detail || false);
                        } else {
                            event = document.createEvent('Event');
                            event.initEvent(eventName, false, false);
                        }
                    } catch (e) {
                        event = document.createEventObject();
                        event.type = eventName;
                    }
                }
                Objs.extend(event, parameters);
                element.dispatchEvent(event);
                if (onEventHandler) {
                    if (!onEventCalled)
                        onEventHandler.call(element, event);
                    element[onEvent] = onEventHandler;
                }
            } catch (e) {
                if (onEventHandler)
                    element[onEvent] = onEventHandler;
                throw e;
            }
        },

        elementOffset: function(element) {
            element = this.unbox(element);
            var top = 0;
            var left = 0;
            if (element.getBoundingClientRect) {
                var box = element.getBoundingClientRect();
                top = box.top;
                left = box.left - (document.body.getBoundingClientRect ? document.body.getBoundingClientRect().left : 0);
            }
            docElem = document.documentElement;
            return {
                top: top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
                left: left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
            };
        },

        getRelativeCoordinates: function(event, element) {

            var position = {
                x: event.pageX,
                y: event.pageY
            };

            var offset = {
                left: element.offsetLeft,
                top: element.offsetTop
            };

            var reference = element.offsetParent;

            while (reference != null) {
                offset.left += reference.offsetLeft;
                offset.top += reference.offsetTop;
                reference = reference.offsetParent;
            }

            return {
                x: position.x - offset.left,
                y: position.y - offset.top
            };

        },


        elementDimensions: function(element) {
            element = this.unbox(element);
            var cs, w, h;
            if (element && window.getComputedStyle) {
                try {
                    cs = window.getComputedStyle(element);
                } catch (e) {}
                if (cs) {
                    w = parseInt(cs.width, 10);
                    h = parseInt(cs.height, 10);
                    if (w && h) {
                        return {
                            width: w,
                            height: h
                        };
                    }
                }
            }
            if (element && element.currentStyle) {
                cs = element.currentStyle;
                w = element.clientWidth - parseInt(cs.paddingLeft || 0, 10) - parseInt(cs.paddingRight || 0, 10);
                h = element.clientHeight - parseInt(cs.paddingTop || 0, 10) - parseInt(cs.paddingTop || 0, 10);
                if (w && h) {
                    return {
                        width: w,
                        height: h
                    };
                }
            }
            if (element && element.getBoundingClientRect) {
                var box = element.getBoundingClientRect();
                h = box.bottom - box.top;
                w = box.right - box.left;
                return {
                    width: w,
                    height: h
                };
            }
            return {
                width: 0,
                height: 0
            };
        },

        childContainingElement: function(parent, element) {
            parent = this.unbox(parent);
            element = this.unbox(element);
            while (element.parentNode != parent) {
                if (element == document.body)
                    return null;
                element = element.parentNode;
            }
            return element;
        },

        elementBoundingBox: function(element) {
            var offset = this.elementOffset(element);
            var dimensions = this.elementDimensions(element);
            return {
                left: offset.left,
                top: offset.top,
                right: offset.left + dimensions.width - 1,
                bottom: offset.top + dimensions.height - 1
            };
        },

        pointWithinElement: function(x, y, element) {
            var bb = this.elementBoundingBox(element);
            return bb.left <= x && x <= bb.right && bb.top <= y && y <= bb.bottom;
        },

        elementFromPoint: function(x, y, disregarding, parent) {
            disregarding = disregarding || [];
            if (!Types.is_array(disregarding))
                disregarding = [disregarding];
            var backup = [];
            for (var i = 0; i < disregarding.length; ++i) {
                disregarding[i] = this.unbox(disregarding[i]);
                backup.push(disregarding[i].style.zIndex);
                disregarding[i].style.zIndex = -1;
            }
            var element = document.elementFromPoint(x - window.pageXOffset, y - window.pageYOffset);
            for (i = 0; i < disregarding.length; ++i)
                disregarding[i].style.zIndex = backup[i];
            while (element && parent && element.parentNode !== parent)
                element = element.parentNode;
            return element;
        },

        elementAddClass: function(element, cls) {
            if (!element.className)
                element.className = cls;
            else if (!this.elementHasClass(element, cls))
                element.className = element.className + " " + cls;
        },

        elementHasClass: function(element, cls) {
            return element.className.split(" ").some(function(name) {
                return name === cls;
            });
        },

        elementRemoveClass: function(element, cls) {
            element.className = element.className.split(" ").filter(function(name) {
                return name !== cls;
            }).join(" ");
        },

        elementInsertBefore: function(element, before) {
            before.parentNode.insertBefore(element, before);
        },

        elementInsertAfter: function(element, after) {
            if (after.nextSibling)
                after.parentNode.insertBefore(element, after.nextSibling);
            else
                after.parentNode.appendChild(element);
        },

        elementInsertAt: function(element, parent, index) {
            if (index >= parent.children.length)
                parent.appendChild(element);
            else
                parent.insertBefore(element, parent.children[Math.max(0, index)]);
        },

        elementIndex: function(element) {
            var idx = 0;
            while (element.previousElementSibling) {
                idx++;
                element = element.previousElementSibling;
            }
            return idx;
        },

        elementPrependChild: function(parent, child) {
            if (parent.children.length > 0)
                parent.insertBefore(child, parent.firstChild);
            else
                parent.appendChild(child);
        },

        // Will find closest parent element, will stop on stopSelector
        // example:  Dom.elementReplaceClasses(element, '.look-element-class-name', '.stop-on-class-name')
        elementFindClosestParent: function(element, selector, stopSelector) {
            var _returnVal = null;
            while (element) {
                if (element.className.indexOf(selector) > -1) {
                    _returnVal = element;
                    break;
                } else if (stopSelector && element.className.indexOf(stopSelector) > -1) {
                    break;
                }
                element = element.parentElement;
            }
            return _returnVal;
        },

        // Will replace class names on element
        elementReplaceClasses: function(element, replaceClass, replaceWith) {
            if (this.elementHasClass(element, replaceClass)) {
                this.elementRemoveClass(element, replaceClass);
                this.elementAddClass(element, replaceWith);
            }
        },

        // When element in visible port view, will return true
        isElementVisible: function(element, fraction) {
            fraction = fraction || 0.8;

            var offset = this.elementOffset(element);
            var x = offset.left;
            var y = offset.top;
            var w = element.offsetWidth;
            var h = element.offsetHeight;
            var right = x + w;
            var bottom = y + h;

            var visibleX = Math.max(0, Math.min(w, window.pageXOffset + window.innerWidth - x, right - window.pageXOffset));
            var visibleY = Math.max(0, Math.min(h, window.pageYOffset + window.innerHeight - y, bottom - window.pageYOffset));

            var visible = visibleX * visibleY / (w * h);

            return (visible > fraction);
        },

        keyboardUnfocus: function() {
            if (document.activeElement)
                document.activeElement.blur();
        },

        passiveEventsSupported: function() {
            return Info.isiOS();
        },

        containerStickyBottom: function(someElement) {
            var lastScrollHeight = someElement.scrollHeight;
            var critical = false;
            var observer = new MutationObserver(function() {
                if (critical)
                    return;
                critical = true;
                var newScrollHeight = someElement.scrollHeight;
                var oldScrollHeight = lastScrollHeight;
                lastScrollHeight = newScrollHeight;
                if (newScrollHeight > oldScrollHeight)
                    someElement.scrollTop = someElement.scrollTop + newScrollHeight - oldScrollHeight;
                critical = false;
            });
            observer.observe(someElement, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
            return observer;
        },

        isInputLikeElement: function(element) {
            return element.nodeName === "TEXTAREA" || element.nodeName === "INPUT";
        },

        copyStringToClipboard: function(s) {
            var input = document.createElement("input");
            input.style.display = 'none';
            document.body.appendChild(input);
            input.value = s;
            this.copyInputValueToClipboard(input);
            document.body.removeChild(input);
        },

        copyInputValueToClipboard: function(element) {
            if (document.body.createTextRange) {
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(element);
                textRange.select();
                return textRange.execCommand("Copy");
            } else if (window.getSelection && document.createRange) {
                var oldContentEditable = element.contentEditable;
                var oldReadOnly = element.readOnly;
                element.contentEditable = true;
                element.readOnly = false;
                var range = document.createRange();
                range.selectNodeContents(element);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range); // Does not work for Firefox if a textarea or input
                if (this.isInputLikeElement(element))
                    element.select(); // Firefox will only select a form element with select()
                if (Info.isiOS())
                    element.setSelectionRange(0, 999999);
                element.contentEditable = oldContentEditable;
                element.readOnly = oldReadOnly;
                return document.execCommand("copy");
            }
            return false;
        },

        onScrollIntoView: function(element, visibilityFraction, callback, context) {
            if (this.isElementVisible(element, visibilityFraction)) {
                callback.call(context);
                return;
            }
            var cb = function() {
                if (Dom.isElementVisible(element, visibilityFraction)) {
                    callback.call(context);
                    document.removeEventListener("scroll", cb);
                }
            };
            document.addEventListener("scroll", cb);
        }

    };

    return Dom;
});
Scoped.define("module:Geometry", [], function() {
    return {
        /**
         *
         * @param videoWidth
         * @param videoHeight
         * @param embedWidth
         * @param embedHeight
         */
        padFitBoxInBox: function(videoWidth, videoHeight, embedWidth, embedHeight) {
            var videoAR = videoWidth / videoHeight;
            var embedAR = embedWidth / embedHeight;
            var scale = videoAR > embedAR ? (embedWidth / videoWidth) : (embedHeight / videoHeight);
            return {
                scale: scale,
                offsetX: videoAR < embedAR ? (embedWidth - videoWidth * scale) / 2 : 0,
                offsetY: videoAR > embedAR ? (embedHeight - videoHeight * scale) / 2 : 0
            };
        }
    };
});
Scoped.define("module:Selection", [
    "module:Dom"
], function(Dom) {
    return {

        /** @suppress {checkTypes} */
        selectNode: function(node, offset) {
            var selection = null;
            var range = null;
            if (window.getSelection) {
                selection = window.getSelection();
                selection.removeAllRanges();
                range = document.createRange();
            } else if (document.selection) {
                selection = document.selection;
                range = selection.createRange();
            }
            if (offset) {
                range.setStart(node, offset);
                range.setEnd(node, offset);
                selection.addRange(range);
            } else {
                range.selectNode(node);
                selection.addRange(range);
            }
        },

        /** @suppress {checkTypes} */
        selectedHtml: function() {
            if (window.getSelection)
                return window.getSelection().toString();
            else if (document.selection)
                return document.selection.createRange().htmlText;
            return "";
        },

        /** @suppress {checkTypes} */
        selectionStartOffset: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).startOffset;
            else if (document.selection)
                return document.selection.createRange().startOffset;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionEndOffset: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).endOffset;
            else if (document.selection)
                return document.selection.createRange().endOffset;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionNonEmpty: function() {
            var start = this.selectionStart();
            var end = this.selectionEnd();
            return start && end && start && end && (start != end || this.selectionStartOffset() != this.selectionEndOffset());
        },

        /** @suppress {checkTypes} */
        selectionContained: function(node) {
            return node.contains(this.selectionStart()) && node.contains(this.selectionEnd());
        },

        /** @suppress {checkTypes} */
        selectionNodes: function() {
            var result = [];
            var start = this.selectionStart();
            var end = this.selectionEnd();
            result.push(start);
            var current = start;
            while (current != end) {
                current = Dom.traverseNext(current);
                result.push(current);
            }
            return result;
        },

        /** @suppress {checkTypes} */
        selectionLeaves: function() {
            return this.selectionNodes().filter(function(node) {
                return !node.hasChildNodes();
            });
        },

        /** @suppress {checkTypes} */
        selectionStartNode: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).startContainer;
            else if (document.selection)
                return document.selection.createRange().startContainer;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionAncestor: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).commonAncestorContainer;
            else if (document.selection)
                return document.selection.createRange().parentElement();
            return null;
        },

        /** @suppress {checkTypes} */
        selectionStart: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).startContainer;
            else if (document.selection)
                return document.selection.createRange().startContainer;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionEnd: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).endContainer;
            else if (document.selection)
                return document.selection.createRange().endContainer;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionSplitOffsets: function() {
            var startOffset = this.selectionStartOffset();
            var endOffset = this.selectionEndOffset();
            var start = this.selectionStart();
            var end = this.selectionEnd();
            var single = start == end;
            if (endOffset < end.wholeText.length) {
                end.splitText(endOffset);
                if (single)
                    start = end;
            }
            if (startOffset > 0) {
                start = start.splitText(startOffset);
                if (single)
                    end = start;
            }
            this.selectRange(start, end);
        },

        /** @suppress {checkTypes} */
        selectRange: function(start_node, end_node, start_offset, end_offset) {
            var selection = null;
            var range = null;
            if (window.getSelection) {
                selection = window.getSelection();
                selection.removeAllRanges();
                range = document.createRange();
            } else if (document.selection) {
                selection = document.selection;
                range = selection.createRange();
            }
            range.setStart(start_node, start_offset || 0);
            range.setEnd(end_node, end_offset || end_node.data.length);
            selection.addRange(range);
        }

    };
});
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
Scoped.define("module:Upload.CordovaFileUploader", [
    "module:Upload.FileUploader",
    "module:Info",
    "base:Promise",
    "base:Ajax.Support",
    "base:Objs"
], function(FileUploader, Info, Promise, AjaxSupport, Objs, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, {

        _acquirePermission: function() {
            var promise = Promise.create();
            if (Info.isAndroid()) {
                var perms = cordova.plugins.permissions;
                perms.checkPermission(perms.READ_EXTERNAL_STORAGE, function(status) {
                    if (!status.hasPermission) {
                        perms.requestPermission(perms.READ_EXTERNAL_STORAGE, function(status) {
                            if (status.hasPermission)
                                promise.asyncSuccess(true);
                            else
                                promise.asyncError("Access to storage was not granted");
                        }, function() {
                            promise.asyncError("Could not request storage permission");
                        });
                    } else
                        promise.asyncSuccess(true);
                }, function() {
                    promise.asyncError("Could not check storage permission");
                });
            } else
                promise.asyncSuccess(true);
            return promise;
        },

        _upload: function() {
            return this._acquirePermission().mapSuccess(function() {
                return window.resolveLocalFileSystemURL ? this._uploadWithLocalFileSystem() : this._uploadWithPlugin();
            }, this);
        },

        _uploadWithPlugin: function() {
            var self = this;
            //var fileURI = this._options.source.localURL;
            var fileURI = this._options.source.fullPath.split(':')[1];
            var fileUploadOptions = new window.FileUploadOptions();
            fileUploadOptions.fileKey = "file";
            fileUploadOptions.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
            fileUploadOptions.mimeType = this._options.source.type;
            fileUploadOptions.httpMethod = this._options.method;
            fileUploadOptions.params = this._options.data;
            var fileTransfer = new window.FileTransfer();
            fileTransfer.upload(fileURI, this._options.url, function(data) {
                self._successCallback(data);
            }, function(data) {
                self._errorCallback(data);
            }, fileUploadOptions);
        },

        _uploadWithLocalFileSystem: function() {
            var self = this;
            var fileURI = this._options.source.fullPath;
            window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
                        var blob = new Blob([new Uint8Array(this.result)], {
                            type: self._options.source.type
                        });
                        var data = Objs.clone(self._options.data || {}, 1);
                        data.file = blob;
                        return AjaxSupport.execute({
                            method: self._options.method,
                            uri: self._options.url,
                            decodeType: "text",
                            data: data
                        }, self._progressCallback, self).success(self._successCallback, self).error(self._errorCallback, self);
                    };
                    // Read the file as an ArrayBuffer
                    reader.readAsArrayBuffer(file);
                }, function(err) {
                    self._errorCallback(err);
                });
            }, function(err) {
                self._errorCallback(err);
            });
        }
    }, {

        supported: function(options) {
            var result = !!navigator.device &&
                !!navigator.device.capture &&
                !!navigator.device.capture.captureVideo &&
                !!(window.resolveLocalFileSystemURL || (window.FileTransfer && window.FileUploadOptions)) &&
                !options.isBlob &&
                ("localURL" in options.source || "fullPath" in options.source);
            return result;
        }

    });
});
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
Scoped.define("module:Upload.FormDataFileUploader", [
    "module:Upload.FileUploader",
    "module:Info",
    "base:Ajax.Support",
    "base:Objs",
    "base:Types"
], function(FileUploader, Info, AjaxSupport, Objs, Types, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, {

        _upload: function() {
            var data = Objs.clone(Types.is_empty(this._options.data) ? {} : this._options.data, 1);
            data.file = this._options.isBlob ? this._options.source : this._options.source.files[0];
            this._request = AjaxSupport.create();
            return AjaxSupport.execute({
                method: this._options.method,
                uri: this._options.url,
                decodeType: "text",
                data: data,
                noFormData: this._options.noFormData
            }, this._progressCallback, this, this._request).success(this._successCallback, this).error(this._errorCallback, this);
        }

    }, {

        supported: function(options) {
            if (Info.isInternetExplorer() && Info.internetExplorerVersion() <= 9 || (Info.isCordova() && ("localURL" in options.source || "fullPath" in options.source)))
                return false;
            try {
                new(window.FormData)();
            } catch (e) {
                return false;
            }
            return true;
        }

    });
});
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
            form.method = this._options.method;
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
Scoped.define("module:Upload.MultiUploader", [
    "module:Upload.FileUploader",
    "base:Objs"
], function(FileUploader, Objs, scoped) {
    return FileUploader.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                inherited.constructor.call(this, options);
                this._uploaders = {};
                this._uploadLimit = this._options.uploadLimit || 5;
                this._uploadingCount = 0;
                this._end = !this._options.manualEnd;
            },

            end: function() {
                this._end = true;
                this._updateState();
            },

            addUploader: function(uploader) {
                this._uploaders[uploader.cid()] = uploader;
                uploader.on("state", this._updateState, this);
                uploader.on("progress", this._updateProgress, this);
                if (this.state() === "uploading") {
                    if (uploader.state() === "error")
                        uploader.reset();
                    if (uploader.state() === "idle" && this._uploadingCount < this._uploadLimit) {
                        this._uploadingCount++;
                        uploader.upload();
                    }
                }
                return this;
            },

            _upload: function() {
                Objs.iter(this._uploaders, function(uploader) {
                    if (uploader.state() === "error")
                        uploader.reset();
                    if (uploader.state() === "idle" && this._uploadingCount < this._uploadLimit) {
                        this._uploadingCount++;
                        uploader.upload();
                    }
                }, this);
                this._updateState();
            },

            _updateState: function() {
                if (this.state() !== "uploading")
                    return;
                this._uploadingCount = 0;
                var error = false;
                var idleCount = 0;
                Objs.iter(this._uploaders, function(uploader) {
                    switch (uploader.state()) {
                        case "uploading":
                            this._uploadingCount++;
                            break;
                        case "error":
                            error = true;
                            break;
                        case "idle":
                            idleCount++;
                            break;
                    }
                }, this);
                if (idleCount > 0 && this._uploadingCount < this._uploadLimit) {
                    Objs.iter(this._uploaders, function(uploader) {
                        if (this._uploadingCount < this._uploadLimit && uploader.state() === "idle") {
                            uploader.upload();
                            idleCount--;
                            this._uploadingCount++;
                        }
                    }, this);
                }
                if (this._uploadingCount > 0)
                    return;
                if (!this._end)
                    return;
                var datas = [];
                Objs.iter(this._uploaders, function(uploader) {
                    var result = (error && uploader.state() === "error") || (!error && uploader.state() === "success") ? uploader.data() : undefined;
                    datas.push(result);
                }, this);
                if (error > 0)
                    this._errorCallback(datas);
                else
                    this._successCallback(datas);
            },

            _updateProgress: function() {
                if (this.state() !== "uploading")
                    return;
                this._progressCallback(this.uploadedBytes(), this.totalBytes());
            },

            uploadedBytes: function() {
                var uploaded = 0;
                Objs.iter(this._uploaders, function(uploader) {
                    uploaded += uploader.uploadedBytes();
                }, this);
                return uploaded;
            },

            totalBytes: function() {
                var total = 0;
                Objs.iter(this._uploaders, function(uploader) {
                    total += uploader.totalBytes();
                }, this);
                return total;
            }

        };
    });
});
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
Scoped.define("module:Upload.S3MultipartSupport", [
    "base:Maths"
], function(Maths) {
    var MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
    var MAX_CHUNK_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB
    var MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 * 1024; // 5 TB
    var MAX_NUMBER_OF_CHUNKS = 10000;
    var DEFAULT_CHUNK_SIZE = 50 * 1024 * 1024; // 50 MB
    var MAX_FILE_SIZE_FOR_DEFAULT_CHUNK_SIZE = DEFAULT_CHUNK_SIZE * MAX_NUMBER_OF_CHUNKS;

    return {
        /**
         * Split file into multiple chunks that respect AWS limits for multipart upload.
         * @param {Blob | File} file
         * @param {Object} [options]
         * @param {number} options.numberOfChunks
         * @param {number} options.chunkSize
         * @returns {Blob[]} array of chunks
         */
        chunkFile: function(file, options) {
            if (!this.validateFileSize(file.size)) {
                return [];
            }

            var chunkSize = file.size > MAX_FILE_SIZE_FOR_DEFAULT_CHUNK_SIZE ? MAX_CHUNK_SIZE : DEFAULT_CHUNK_SIZE;
            
            if (options.chunkSize) {
                chunkSize = this.clampChunkSize(options.chunkSize);
                var numberOfChunks = this.calculateNumberOfChunks(file.size, chunkSize);
                if (options.numberOfChunks && numberOfChunks > this.clampNumberOfChunks(options.numberOfChunks)) {
                    // chunk size is too small for the current number of chunks, we are prioritizing number of chunks over chunk size
                    chunkSize = this.clampChunkSize(this.calculateChunkSize(file.size, this.clampNumberOfChunks(options.numberOfChunks)));
                }
            } else if (options.numberOfChunks) {
                chunkSize = this.clampChunkSize(this.calculateChunkSize(file.size, this.clampNumberOfChunks(options.numberOfChunks)));
            }

            var startPointer = 0;
            var endPointer = file.size;
            var chunks = [];
            while (startPointer < endPointer) {
                chunks.push(file.slice(startPointer, startPointer + chunkSize));
                startPointer = startPointer + chunkSize;
            }
            return chunks;
        },

        /**
         * Sort parts by part number, as AWS require them to be sent in order.
         * @param {Object[]} parts - list of parts
         * @param {string} parts[].ETag - the part's ETag response header, which is sent after successfull part upload
         * @param {number} parts[].PartNumber - the part's part number
         * @returns {Object[]}
         */
        sortParts: function(parts) {
            return parts.sort(function(prevPart, nextPart) {
                return prevPart.PartNumber < nextPart.PartNumber ? -1 : 1;
            });
        },

        /**
         * Validate whether file size is within AWS limits for multipart upload.
         * @param {number} fileSize - file size in bytes
         * @returns {boolean}
         */
        validateFileSize: function(fileSize) {
            return fileSize > 0 && fileSize <= MAX_FILE_SIZE;
        },

        /**
         * Validate whether chunk size is within AWS limits for multipart upload.
         * @param {number} chunkSize - chunk size in bytes
         * @returns {boolean}
         */
        validateChunkSize: function(chunkSize) {
            return chunkSize >= MIN_CHUNK_SIZE && chunkSize <= MAX_CHUNK_SIZE;
        },

        /**
         * Validate whether number of chunks is within AWS limits for multipart upload.
         * @param {number} numberOfChunks
         * @returns {boolean}
         */
        validateNumberOfChunks: function(numberOfChunks) {
            return numberOfChunks >= 1 && numberOfChunks <= MAX_NUMBER_OF_CHUNKS;
        },

        /**
         * Calculate chunk size, given the file size and number of chunks.
         * @param {number} fileSize - file size in bytes
         * @param {number} numberOfChunks
         * @returns {number} chunk size in bytes
         */
        calculateChunkSize: function(fileSize, numberOfChunks) {
            return Math.ceil(fileSize / numberOfChunks);
        },

        /**
         * Calculate number of chunks, given the file size and chunk size.
         * @param {number} fileSize - file size in bytes
         * @param {number} chunkSize - chunk size in bytes
         * @returns {number}
         */
        calculateNumberOfChunks: function(fileSize, chunkSize) {
            return Math.ceil(fileSize / (chunkSize || DEFAULT_CHUNK_SIZE));
        },

        /**
         * Clamp chunk size using AWS limits as upper and lower bounds.
         * @param {number} chunkSize
         * @returns {number} clamped chunk size
         */
        clampChunkSize: function(chunkSize) {
            return Maths.clamp(chunkSize, MIN_CHUNK_SIZE, MAX_CHUNK_SIZE);
        },

        /**
         * Clamp number of chunks using AWS limits as upper and lower bounds.
         * @param {number} numberOfChunks
         * @returns {number} clamped number of chunks
         */
        clampNumberOfChunks: function(numberOfChunks) {
            return Maths.clamp(numberOfChunks, 1, MAX_NUMBER_OF_CHUNKS);
        }
    };
});
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
            }

        };
    }, {

        supported: function(options) {
            return typeof(window.Blob) !== "undefined" && options.serverSupportsChunked;
        }

    });

});
}).call(Scoped);