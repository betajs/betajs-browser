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
		BetaJS.Browser.Info.setNavigator(BetaJS.Objs.extend({
			userAgent: userAgent,
			appName: "Netscape",
			appVersion: userAgent.substr(userAgent.indexOf("/") + 1)
		}, other));
		var ident = [device, os, browser].join(" ");
		QUnit.equal(BetaJS.Browser.Info.getDevice().key, device, "Device: " + ident);
		QUnit.equal(BetaJS.Browser.Info.getOS().key, os, "OS: " + ident);
		QUnit.equal(BetaJS.Browser.Info.getBrowser().key, browser, "Browser: " + ident);
	};
	
	check("desktop", "macosx", "safari", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/600.5.17 (KHTML, like Gecko) Version/8.0.5 Safari/600.5.17");
	
	check("desktop", "macosx", "chrome", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36", {window_chrome: true});
	QUnit.equal(BetaJS.Browser.Info.chromeVersion(), 42.0, "Chrome 42.0");

	check("desktop", "macosx", "chrome", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36", {window_chrome: true});
	QUnit.equal(BetaJS.Browser.Info.chromeVersion(), 47.0, "Chrome 47.0");
	
	check("desktop", "macosx", "opera", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36 OPR/28.0.1750.51", {window_chrome: true});
	QUnit.equal(BetaJS.Browser.Info.operaVersion(), 28.0, "Opera 28.0");
	
	check("desktop", "macosx", "firefox", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:36.0) Gecko/20100101 Firefox/36.0", {appVersion: "Mozilla/5.0 (Macintosh)"});
	
	check("mobile", "ios", "safari", "Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12F70 Safari/600.1.4");
	
	check("mobile", "ios", "chrome", "Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/42.0.2311.47 Mobile/12F70 Safari/600.1.4 (000607)");
	
	check("mobile", "ios", "opera", "Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) OPiOS/10.0.1.90729 Mobile/12F70 Safari/9537.53");
	
	check("mobile", "ios", "firefox", "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) FxiOS/1.1 Mobile/13B143 Safari/601.1.46");
	
	check("mobile", "android", "chrome", "Mozilla/5.0 (Linux; Android 5.0.2; SM-G920W8 Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.92 Mobile Safari/537.36", {window_chrome: true});
	
	check("mobile", "android", "firefox", "Mozilla/5.0 (Android 5.1.1; Mobile; rv:42.0) Gecko/42.0 Firefox/42.0");
	
	check("desktop", "windows", "edge", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240", {window_chrome: true});
	
	check("desktop", "windows", "internetexplorer", "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko", {appName: "Netscape"});
	QUnit.equal(BetaJS.Browser.Info.internetExplorerVersion(), 11, "IE 11");

	check("desktop", "windows", "internetexplorer", "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)", {appName: "Microsoft Internet Explorer"});
	QUnit.equal(BetaJS.Browser.Info.internetExplorerVersion(), 10, "IE 10");

	check("desktop", "windows", "internetexplorer", "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; WOW64; Trident/5.0)", {appName: "Microsoft Internet Explorer"});
	QUnit.equal(BetaJS.Browser.Info.internetExplorerVersion(), 9, "IE 9");

	check("desktop", "windows", "internetexplorer", "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET4.0C)", {appName: "Microsoft Internet Explorer"});
	QUnit.equal(BetaJS.Browser.Info.internetExplorerVersion(), 8, "IE 8");

	check("mobile", "windowsphone", "iemobile", "Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 920) like Gecko");
	
});
