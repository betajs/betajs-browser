window.Helper = {
			
	test: function (opts) {
		var setup = MockAjax.createTest(opts);
		QUnit.test(setup.name, function (assert) {
			var request = setup.request;
			assert.equal(BetaJS.Ajax.Support.preprocess({uri: request.uri}).isCorsRequest, opts.origin === "cross");
			var done = assert.async();
			MockAjax.runTest(setup, function () {
				BetaJS.Ajax.Support.execute(setup.ajax).callback(function (error, success) {
					var has_error = !!error;
					if (has_error == (opts.should === "succeed")) {
						assert.ok(false, "should " + opts.should + " but does not");
						done();
						return;
					}
					MockAjax.requestLog(setup.request, function (log) {
						MockAjax.qunitCheckLog(log, setup);
						if (!error)
							assert.deepEqual(log, success);
						done();
					}, function (e) {
						assert.ok(false, "Log should not fail");
						done();
					});
				});
			});
			
		});
	}
					
};
