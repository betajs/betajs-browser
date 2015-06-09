test("test os info", function() {
	QUnit.notEqual(BetaJS.Browser.Info.formatOS(), "Unknown Operating System");
});

test("test browser info", function() {
	QUnit.notEqual(BetaJS.Browser.Info.formatBrowser(), "Unknown Browser");
});

test("test flash info", function() {
	QUnit.notEqual(BetaJS.Browser.Info.formatFlash().substring(0, 4), "Flash");
});



test("test different browsers", function () {
	var check = function (device, os, browser, userAgent, other) {
		BetaJS.Browser.Info.setNavigator(BetaJS.Objs.extend(other, {
			userAgent: userAgent,
			appName: "Netscape",
			appVersion: userAgent.substr(userAgent.indexOf("/") + 1)
		}));
		var ident = [device, os, browser].join(" ");
		QUnit.equal(BetaJS.Browser.Info.getDevice().key, device, "Device: " + ident);
		QUnit.equal(BetaJS.Browser.Info.getOS().key, os, "OS: " + ident);
		QUnit.equal(BetaJS.Browser.Info.getBrowser().key, browser, "Browser: " + ident);
	};
	
	check("desktop", "macosx", "safari", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/600.5.17 (KHTML, like Gecko) Version/8.0.5 Safari/600.5.17");
	
	check("desktop", "macosx", "chrome", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36", {window_chrome: true});
	
	check("desktop", "macosx", "opera", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36 OPR/28.0.1750.51", {window_chrome: true});
	
	check("desktop", "macosx", "firefox", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:36.0) Gecko/20100101 Firefox/36.0", {appVersion: "Mozilla/5.0 (Macintosh)"});
	
	check("mobile", "ios", "safari", "Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12F70 Safari/600.1.4");
	
	check("mobile", "ios", "chrome", "Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/42.0.2311.47 Mobile/12F70 Safari/600.1.4 (000607)");
	
	check("mobile", "ios", "opera", "Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) OPiOS/10.0.1.90729 Mobile/12F70 Safari/9537.53");
	
	check("mobile", "android", "chrome", "Mozilla/5.0 (Linux; Android 5.0.2; SM-G920W8 Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.92 Mobile Safari/537.36", {window_chrome: true});
});