window.Helper = {
			
	test: function (opts) {
		var setup = MockAjax.createTest(opts);
		test(setup.name, function () {
			var request = setup.request;
			QUnit.equal(BetaJS.Ajax.Support.preprocess({uri: request.uri}).isCorsRequest, opts.origin === "cross");
			stop();
			MockAjax.runTest(setup, function () {
				BetaJS.Ajax.Support.execute(setup.ajax).callback(function (error, success) {
					var has_error = !!error;
					if (has_error == (opts.should === "succeed")) {
						ok(false, "should " + opts.should + " but does not");
						start();
						return;
					}
					MockAjax.requestLog(setup.request, function (log) {
						MockAjax.qunitCheckLog(log, setup);
						if (!error)
							QUnit.deepEqual(log, success);
						start();
					}, function (e) {
						ok(false, "Log should not fail");
						start();
					});
				});
			});
			
		});
	}
					
};
