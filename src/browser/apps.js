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
            return "http://play.google.com/store/apps/details?id=<" + appIdent + ">";
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