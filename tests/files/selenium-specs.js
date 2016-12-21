
var expect = require('chai').expect;
var assert = require('chai').assert;
var test_file_path = __dirname + "/sample-file.binary";

describe('File Upload', function() {

	it('check status of the link', function() {
		browser.url("/static/tests/files/index.html");
		var status = browser.status();
		expect(status.state).to.eql('success');
	});

	it('Test 1', function() {
		browser.waitForExist('#qunit-test-output0.running');

		browser.chooseFile("#qunit-fixture-visible input[type=file]",
				test_file_path, function(err) {
					assert.isNull(err, "Error, selecting file");
				}).click('button#upload-button', function(err) {
			assert.isNull(err, "File upload button can't be clicked");
		});
		var passed = browser.$('#qunit-test-output0 .counts .passed');
		passed.waitForExist();
		expect(passed.getText()).to.be.equal('2');
	});

	it('Test 2', function() {
		browser.waitForExist('#qunit-test-output0.pass');
		browser.waitForExist('#qunit-test-output1.running');

		browser.chooseFile("#qunit-fixture-visible input:nth-child(1)",
				test_file_path, function(err) {
					expect.isNull(err, 'First file could not be selected');
				}).chooseFile("#qunit-fixture-visible input:nth-child(2)",
				test_file_path, function(err) {
					expect.isNull(err, 'Second file could not be selected');
				}).chooseFile("#qunit-fixture-visible input:nth-child(3)",
				test_file_path, function(err) {
					expect.isNull(err, 'Third file could not be selected');
				}).chooseFile("#qunit-fixture-visible input:nth-child(4)",
				test_file_path, function(err) {
					expect.isNull(err, 'Fourth file could not be selected');
				}).click('button#upload-button', function(err) {
			assert.isNull(err, "File upload button can't be clicked");
		});

		var passed = browser.$('#qunit-test-output1 .counts .passed');
		passed.waitForExist();
		expect(passed.getText()).to.be.equal('5');
		browser.pause(3000);
	});

	it('Test 3', function() {
		browser.waitForExist('#qunit-test-output1.pass');
		browser.waitForExist('#qunit-test-output2.running');

		browser.chooseFile("#qunit-fixture-visible input[type=file]",
				test_file_path, function(err) {
					assert.isNull(err, "Error, selecting file");
				}).click('button#upload-button', function(err) {
			assert.isNull(err, "File upload button can't be clicked");
		});
		var passed = browser.$('#qunit-test-output2 .counts .passed');
		passed.waitForExist();
		expect(passed.getText()).to.be.equal('2');
	});

	it('Test 4', function() {
		browser.waitForExist('#qunit-test-output2.pass');
		browser.waitForExist('#qunit-test-output3.running');

		browser.chooseFile("#qunit-fixture-visible input[type=file]",
				test_file_path, function(err) {
					assert.isNull(err, "Error, selecting file");
				}).click('button#upload-button', function(err) {
			assert.isNull(err, "File upload button can't be clicked");
		});
		var passed = browser.$('#qunit-test-output3 .counts .passed');
		passed.waitForExist();
		expect(passed.getText()).to.be.equal('2');
	});

	after(function(done) {
	});

});
