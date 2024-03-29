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