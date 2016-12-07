var expect = require('chai').expect;
var fs     = require('fs');
var path   = require('path');
var test_file_path = path.join(__dirname, "..", "..", "..", 'files/sample-video2.mp4');
const credentials = require('../../../configurations/constants').browserstack;

// Context of recording video from camera
describe('Upload video with Several Browsers', function() {

  it('check status of the link', function() {
    browser.url(credentials.upload.related_url);
    var status = browser.status();
    expect(status.state).to.eql('success');
  });

  // Will press button record video
  it('Run first upload test', function() {
    browser.waitForExist('#qunit');
    browser.chooseFile("#qunit-fixture-visible input[type=file]", test_file_path);
    browser.click('button#upload-button');

    browser.waitForExist('#qunit-test-output0 ol.qunit-assert-list');
    browser.click('#qunit-test-output0 > strong');

    var firstTestBlock = browser.$('#qunit-test-output0');

    var successMessage = firstTestBlock.$$('.test-message')[0].getText();
    var fileSizeMessage = firstTestBlock.$$('.test-message')[1].getText();

    expect(successMessage).to.contain('Upload Successful');
    expect(fileSizeMessage).to.contain('size check');
  });

  it('Run multiple file upload', function() {
    // browser.url(credentials.upload.related_url + '?testNumber=2');
    // browser.waitForExist('#qunit');

    browser.chooseFile("#qunit-fixture-visible input[name=file0]", test_file_path);
    browser.chooseFile("#qunit-fixture-visible input[name=file1]", test_file_path);
    browser.chooseFile("#qunit-fixture-visible input[name=file2]", test_file_path);
    browser.chooseFile("#qunit-fixture-visible input[name=file3]", test_file_path);

    browser.click('button#upload-button');

    browser.waitForExist('#qunit-test-output1 ol.qunit-assert-list');
    browser.click('#qunit-test-output1 > strong');

    var secondTestBlock = browser.$('#qunit-test-output1');

    var failedResulst = +secondTestBlock.$('.counts > .failed').getText();
    var successMessage = secondTestBlock.$$('.test-message')[0].getText();

    expect(failedResulst).to.equal(0);

    expect(successMessage).to.contain('Upload Successful');

    for( var i = 1 ; i <= 4 ; i++ ) {
      var fileSizeMessage = secondTestBlock.$$('.test-message')[i].getText();
      expect(fileSizeMessage).to.contain('size check');
    }
  });

});

