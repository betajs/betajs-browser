var expect = require('chai').expect;
var fs     = require('fs');
var path   = require('path');
var test_file_path = path.join(__dirname, "..", "..", "..", "..", 'files/sample-video2.mp4');

// Context of recording video from camera
describe('Upload video with Chrome Browser', function() {

  it('check status of the link', function() {
    browser.url('/static/space.html');
    var status = browser.status();

    expect( status.state).to.eql('success');
  });

  // Will press button record video
  it('click on "Upload Video"', function() {
    browser.url('/static/space.html');
    browser.chooseFile("input[class$=-chooser-file]", test_file_path);
    expect(/sample\-video\.mp4$/.test(test_file_path)).to.eql(true);
    //expect(true).to.be.equal(true);
  });

  // Play button has to be visible
  it('Play button has to be visible', function () {
    browser.waitForExist('div[class$=-playbutton-container]');
    assert(browser.isVisible('div[class$=-playbutton-container]'));
  });

  // Click on play button to view video
  it('Click on play button to show video', function () {
    browser.click('div[class$=-playbutton-container]');
    assert(browser.isVisible('div[class$=-playbutton-container]'));
  });
});

