var assert = require('chai').assert;
var expect = require('chai').expect;
var credentials = require('../../../configurations/constants').browserstack;
//var BetaJS = require('../../../../node_modules/betajs/dist/beta.js');

// Context of recording video from camera
describe('Record video with Firefox', function() {
  beforeEach(function(){});
  afterEach(function(){});

  // it('Browser and operation system are correct', function() {
  //   console.log(BetaJS.Browser.formatOS);
  //   assert(BetaJS.Browser.formatOS);
  // });

  it('check status of the link', function() {
    browser.url(credentials.related_url);
    var status = browser.status();

    assert.equal( status.state, 'success', 'Checking the status of the url');
  });

  // Will press button record video
  it('click on "Record Your Video" in chooser', function() {
    browser.click('div[class$=chooser-primary-button]');
    expect(browser.isVisible('      Record     '));
  });

  it('click to start recording video', function(){

  });

  it('countdown block should be visible');
  it('click for wait start recording video');
  it('screenshot should be visible');
  it('left/right buttons should work as expected'); // press 2 right and one left then middle images has to be selected

});
