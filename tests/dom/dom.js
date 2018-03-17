QUnit.test("template to elements", function (assert) {
	assert.equal(BetaJS.Browser.Dom.elementsByTemplate("<foobar></foobar>").length, 1);
    assert.equal(BetaJS.Browser.Dom.elementsByTemplate("<td></td>").length, 1);
    assert.equal(BetaJS.Browser.Dom.elementsByTemplate("<tr></tr>").length, 1);
    assert.equal(BetaJS.Browser.Dom.elementsByTemplate("<th></th>").length, 1);
    assert.equal(BetaJS.Browser.Dom.elementsByTemplate("<foobar></foobar>")[0].querySelectorAll("*").length, 0);
    assert.equal(BetaJS.Browser.Dom.elementsByTemplate("<td></td>")[0].querySelectorAll("*").length, 0);
    assert.equal(BetaJS.Browser.Dom.elementsByTemplate("<tr></tr>")[0].querySelectorAll("*").length, 0);
    assert.equal(BetaJS.Browser.Dom.elementsByTemplate("<th></th>")[0].querySelectorAll("*").length, 0);
});


QUnit.test("dom ready", function (assert) {
	var done = assert.async();
	BetaJS.Browser.Dom.ready(function () {
		assert.ok(true);
		done();
	});
});

QUnit.test("trigger foobar dom event", function (assert) {
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
	assert.equal(onfoobar, 1, "onfoobar");
	assert.equal(eventfoobar, 1, "eventfoobar");
	document.body.removeChild(element);
});

QUnit.test("trigger click dom event", function (assert) {
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
	assert.equal(onclick, 1, "onclick");
	assert.equal(eventclick, 1, "eventclick");
	document.body.removeChild(element);
});

if (!(BetaJS.Browser.Info.isiOS() && BetaJS.Browser.Info.iOSversion().major < 4)) {
QUnit.test("element offset", function (assert) {
	var addLeft = document.body.getBoundingClientRect ? document.body.getBoundingClientRect().left : 0;
	var outerLeft = 20.25;
	var outerTop = 10.75;
	var innerLeft = 42.5;
	var innerTop = 50.5;
	var parent = BetaJS.Browser.Dom.elementByTemplate("<div style='position:fixed;left:" + outerLeft + "px;top:" + outerTop + "px'><div style='padding-left:" + innerLeft + "px;padding-top:" + innerTop + "px'><div id='inner'></div></div></div>");
	document.body.appendChild(parent);
	var elem = document.getElementById("inner");
	var offset = BetaJS.Browser.Dom.elementOffset(elem);
	var roundOuter = BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() <= 9;
	var floorInner = (BetaJS.Browser.Info.isSafari() && BetaJS.Browser.Info.safariVersion() <= 4) ||
	                 (BetaJS.Browser.Info.isOpera() && BetaJS.Browser.Info.operaVersion() < 13) ||
	                 (BetaJS.Browser.Info.isChrome() && BetaJS.Browser.Info.chromeVersion() <= 18) ||
	                 (BetaJS.Browser.Info.isiOS() && BetaJS.Browser.Info.iOSversion().major < 8) ||
	                 (BetaJS.Browser.Info.isAndroid()  && BetaJS.Browser.Info.androidVersion().major < 4);
	var roundIf = function (value, enable) { return enable ? Math.round(value) : value; };
	var floorIf = function (value, enable) { return enable ? Math.floor(value) : value; };
	assert.equal(offset.left + addLeft, roundIf(floorIf(outerLeft, floorInner) + floorIf(innerLeft, floorInner), roundOuter));
	assert.equal(offset.top, roundIf(floorIf(outerTop, floorInner) + floorIf(innerTop, floorInner), roundOuter));
	document.body.removeChild(parent);
});
}

QUnit.test("element width height", function (assert) {
	var parent = BetaJS.Browser.Dom.elementByTemplate("<div style='border:13px solid black;margin:17px;padding:19px;display:inline-block;box-sizing:content-box;background:green' id='inner'><div style='background:red;width:11px;height:11px;border:3px solid black;margin:5px;padding:7px;box-sizing:content-box'></div></div>");
    document.body.appendChild(parent);
    var elem = document.getElementById("inner");
	var dim = BetaJS.Browser.Dom.elementDimensions(elem);
	assert.equal(dim.width, 2*3+2*5+2*7+11);
	assert.equal(dim.height, 2*3+2*5+2*7+11);
    document.body.removeChild(parent);
});