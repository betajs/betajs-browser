QUnit.test("jsdom", function (assert) {
    var done = assert.async();
    require('jsdom').env("<div><div id='qunit-fixture'></div></div>", [], function (err, window) {
        global.window = window;
        global.navigator = window.navigator;
        global.document = window.document;
        assert.ok(true);
        done();
    });
});

require("betajs");
require(__dirname + "/../dist/betajs-browser-noscoped.js");
require(__dirname + "/common/dom.js");
require(__dirname + "/common/info.js");
require(__dirname + "/common/scoped.js");
