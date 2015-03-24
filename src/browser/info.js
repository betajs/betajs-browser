Scoped.define("module:Info", ["module:FlashDetect"], function (FlashDetect) {
	return {				
		
		getNavigator: function () {
			return {
				appCodeName: navigator.appCodeName,
				appName: navigator.appName,
				appVersion: navigator.appVersion,
				cookieEnabled: navigator.cookieEnabled,
				onLine: navigator.onLine,
				platform: navigator.platform,
				userAgent: navigator.userAgent
			};
		},
		
		__cache: {},
		
		__cached: function (key, value_func) {
			if (!(key in this.__cache))
				this.__cache[key] = value_func.apply(this);
			return this.__cache[key];
		},
	
		flash: function () {
			return this.__cached("flash", function () {
				return new FlashDetect();
			});
		},
		
		isiOS: function () {
			return this.__cached("isiOS", function () {
				var ua = navigator.userAgent;
				return ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1 || ua.indexOf('iPad') != -1;
			});
		},
		
		isChrome: function () {
			return this.__cached("isChrome", function () {
				return ("chrome" in window || navigator.userAgent.indexOf('CriOS') != -1)  && !window.opera && navigator.userAgent.indexOf(' OPR/') === -1;
			});
		},
		
		isOpera: function () {
			return this.__cached("isOpera", function () {
				return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
			});
		},
		
		isAndroid: function () {
			return this.__cached("isAndroid", function () {
				return navigator.userAgent.toLowerCase().indexOf("android") != -1;
			});
		},
		
		isWebOS: function () {
			return this.__cached("isWebOS", function () {
				return navigator.userAgent.toLowerCase().indexOf("webos") != -1;
			});
		},
	
		isWindowsPhone: function () {
			return this.__cached("isWindowsPhone", function () {
				return navigator.userAgent.toLowerCase().indexOf("windows phone") != -1;
			});
		},
	
		isBlackberry: function () {
			return this.__cached("isBlackberry", function () {
				return navigator.userAgent.toLowerCase().indexOf("blackberry") != -1;
			});
		},
	
		iOSversion: function () {
			return this.__cached("iOSversion", function () {
				if (!this.isiOS())
					return false;
			    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
			    return {
			    	major: parseInt(v[1], 10),
			    	minor: parseInt(v[2], 10),
			    	revision: parseInt(v[3] || 0, 10)
			    };
			});
		},
		
		isMobile: function () {
			return this.__cached("isMobile", function () {
				return this.isiOS() || this.isAndroid() || this.isWebOS() || this.isWindowsPhone() || this.isBlackberry();
			});
		},
		
		isInternetExplorer: function () {
			return this.__cached("isInternetExplorer", function () {
				//return navigator.appName == 'Microsoft Internet Explorer';
				return this.internetExplorerVersion() !== null;
			});
		},
		
		isFirefox: function () {
			return this.__cached("isFirefox", function () {
				return navigator.userAgent.toLowerCase().indexOf("firefox") != -1;
			});
		},
		
		isSafari: function () {
			return this.__cached("isSafari", function () {
				return !this.isChrome() && navigator.userAgent.toLowerCase().indexOf("safari") != -1;
			});
		},
		
		isWindows: function () {
			return this.__cached("isWindows", function () {
				return navigator.appVersion.toLowerCase().indexOf("win") != -1;
			});
		},
		
		isMacOS: function () {
			return this.__cached("isMacOS", function () {
				return !this.isiOS() && navigator.appVersion.toLowerCase().indexOf("mac") != -1;
			});
		},
		
		isUnix: function () {
			return this.__cached("isUnix", function () {
				return navigator.appVersion.toLowerCase().indexOf("x11") != -1;
			});
		},
		
		isLinux: function () {
			return this.__cached("isLinux", function () {
				return navigator.appVersion.toLowerCase().indexOf("linux") != -1;
			});
		},
		
		internetExplorerVersion: function () {
			if (navigator.appName == 'Microsoft Internet Explorer') {
			    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			    if (re.exec(navigator.userAgent))
			    	return parseFloat(RegExp.$1);
			} else if (navigator.appName == 'Netscape') {
			    var re2 = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
			    if (re2.exec(navigator.userAgent))
			    	return parseFloat(RegExp.$1);
			}
			return null;
		},
		
		inIframe: function () {
		    try {
		        return window.self !== window.top;
		    } catch (e) {
		        return true;
		    }
		},
		
		formatDevice: function () {
			return this.isMobile() ? "Mobile" : "Desktop";
		},
		
		formatOS: function () {
			return this.__cached("formatOS", function () {
				if (this.isMacOS())
					return "Mac OS-X";
				if (this.isWindows())
					return "Windows";
				if (this.isUnix())
					return "Unix";
				if (this.isLinux())
					return "Linux";
				if (this.isiOS())
					return "iOS " + this.iOSversion().major + "." + this.iOSversion().minor + "." + this.iOSversion().revision;
				if (this.isAndroid())
					return "Android";
				if (this.isWebOS())
					return "WebOS";
				if (this.isWindowsPhone())
					return "Windows Phone";
				if (this.isBlackberry())
					return "Blackberry";
				return "Unknown Operating System";
			});
		},
		
		formatBrowser: function () {
			return this.__cached("formatBrowser", function () {
				if (this.isChrome())
					return "Chrome";
				if (this.isOpera())
					return "Opera";
				if (this.isInternetExplorer())
					return "Internet Explorer " + this.internetExplorerVersion();
				if (this.isFirefox())
					return "Firefox";
				if (this.isSafari())
					return "Safari";
				if (this.isAndroid())
					return "Android";
				if (this.isWebOS())
					return "WebOS";
				if (this.isWindowsPhone())
					return "Windows Phone";
				if (this.isBlackberry())
					return "Blackberry";
				return "Unknown Browser";
			});
		},
		
		formatFlash: function () {
			return this.flash().installed() ?
				("Flash " + this.flash().version().raw) :
				(this.flash().supported() ?
					"Flash not installed but supported" :
					"Flash not supported");
		}
		
	};
});	
