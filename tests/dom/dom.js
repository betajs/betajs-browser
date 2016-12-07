test("template to elements", function () {
	var elements = BetaJS.Browser.Dom.elementsByTemplate("<foobar></foobar>");
	QUnit.ok(elements.length > 0);
});


test("trigger foobar dom event", function () {
	var element = document.createElement("div");
	document.body.appendChild(element);
	var onfoobar = 0;
	var eventfoobar = 0;
	element.onfoobar = function () {
		onfoobar++;
	};
	element.addEventListener("foobar", function () {
		eventfoobar++;
	});
	BetaJS.Browser.Dom.triggerDomEvent(element, "foobar");
	QUnit.equal(onfoobar, 1, "onfoobar");
	QUnit.equal(eventfoobar, 1, "eventfoobar");
	document.body.removeChild(element);
});

test("trigger click dom event", function () {
	var element = document.createElement("div");
	document.body.appendChild(element);
	var onclick = 0;
	var eventclick = 0;
	element.onclick = function () {
		onclick++;
	};
	element.addEventListener("click", function () {
		eventclick++;
	});
	BetaJS.Browser.Dom.triggerDomEvent(element, "click");
	QUnit.equal(onclick, 1, "onclick");
	QUnit.equal(eventclick, 1, "eventclick");
	document.body.removeChild(element);
});

if (!(BetaJS.Browser.Info.isiOS() && BetaJS.Browser.Info.iOSversion().major < 4)) {
test("element offset", function () {
	var outerLeft = 20.25;
	var outerTop = 10.75;
	var innerLeft = 42.5;
	var innerTop = 50.5;
	var parent = $("<div style='position:fixed;left:" + outerLeft + "px;top:" + outerTop + "px'><div style='padding-left:" + innerLeft + "px;padding-top:" + innerTop + "px'><div id='inner'></div></div></div>");
	$(document.body).append(parent);
	var elem = $("#inner").get(0);
	var offset = BetaJS.Browser.Dom.elementOffset(elem);
	var roundOuter = BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() <= 9;
	var floorInner = (BetaJS.Browser.Info.isSafari() && BetaJS.Browser.Info.safariVersion() <= 4) ||
	                 (BetaJS.Browser.Info.isOpera() && BetaJS.Browser.Info.operaVersion() < 13) ||
	                 (BetaJS.Browser.Info.isChrome() && BetaJS.Browser.Info.chromeVersion() <= 15) ||
	                 (BetaJS.Browser.Info.isiOS() && BetaJS.Browser.Info.iOSversion().major < 8) ||
	                 (BetaJS.Browser.Info.isAndroid()  && BetaJS.Browser.Info.androidVersion().major < 4);
	var roundIf = function (value, enable) { return enable ? Math.round(value) : value; };
	var floorIf = function (value, enable) { return enable ? Math.floor(value) : value; };
	QUnit.equal(offset.left, roundIf(floorIf(outerLeft, floorInner) + floorIf(innerLeft, floorInner), roundOuter));
	QUnit.equal(offset.top, roundIf(floorIf(outerTop, floorInner) + floorIf(innerTop, floorInner), roundOuter));
	parent.remove();
});
}

test("element width height", function () {
	var parent = $("<div style='border:13px solid black;margin:17px;padding:19px;display:inline-block;box-sizing:content-box;background:green' id='inner'><div style='background:red;width:11px;height:11px;border:3px solid black;margin:5px;padding:7px;box-sizing:content-box'></div></div>");
	$(document.body).append(parent);
	var elem = $("#inner").get(0);
	var dim = BetaJS.Browser.Dom.elementDimensions(elem);
	QUnit.equal(dim.width, 2*3+2*5+2*7+11);
	QUnit.equal(dim.height, 2*3+2*5+2*7+11);
	parent.remove();
});