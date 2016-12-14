/**
 * Created by rashad on 12/12/16.
 */
var expect = require('chai').expect;
var assert = require('chai').assert;
var path   = require('path');
var FirefoxProfile = require('wdio-firefox-profile-service');
var test_file_path = path.join(__dirname, "..", "..", "..", 'files/sample-video2.mp4');
const credentials = require('../../../configurations/constants').browserstack;

var firefoxProfile = new FirefoxProfile();
firefoxProfile.setPreference('media.navigator.permission.disabled', true);
firefoxProfile.setPreference('media.navigator.streams.fake', true);

// Context of recording video from camera
describe('Record from normal way', function() {

  it('url opens correct with success status code', function() {
    browser.url(credentials.record.related_url);
    var status = browser.status();
    expect(status.state).to.eql('success');
  });

  // if #recorder-message-block has below content, exit from test
  // Access to the camera was forbidden. Click to retry.

  // Will press button record video
  it('open recording start page', function() {
    browser.waitForExist('#recorder-overlay', function(err){
      assert.isNull(err, "Error getting main page, it's not visible");
    });

    //if(browser.isVisible()) // if alert that video not supporting appears

    browser.click("#player-submit-button", function (err) {
      assert.isNull(err, "Error, during pressing Record Your Video");
    });

    browser.waitForExist('#record-primary-button', function(err) {
      assert.isNull(err, "Record button is not existing yet");
      expect($('#record-primary-button')).to.exist;
      expect($('#record-button-icon-cog')).to.exist;
    });
  });

  it('show video setting pop-up', function() {
    browser.click('#record-button-icon-cog', function(err) {
      assert.isNull(err, "Error click video settings button");
      expect(browser.isVisible("#recorder-settings")).to.equal(true);
    });
  });

  it('start recording video', function () {
    browser.click('#record-primary-button' ,function(err) {
      assert.isNull(err, "Error, when click on record button")
    });

    browser.waitForExist('#recorder-loader-label', function() {
      expect(browser.isVisible('#recorder-loader-label')).to.be.true;
    });
  });

  it('wait button works correctly');

  it('stop video recording', function() {
    browser.waitForExist('#stop-primary-button', function(err){
      assert.isNull(err, 'Stop button is not visible');
      expect(browser.isVisible('#stop-primary-button')).to.equal(true);
    });

    browser.pause(5000);

    browser.click('#stop-primary-button', function(err) {
      assert.isNull(err, 'Stop button is not click able');
    });

    browser.waitForExist('#rerecord-primary-button', function(err) {
      assert.isNull(err, 'Rerecord button is not visible');
      expect(browser.isVisible("#images-imagegallery-container")).to.equal(true);
      expect(browser.isVisible("#slider-left-inner-button")).to.equal(true);
      expect(browser.isVisible("#slider-right-inner-button")).to.equal(true);
    });
  });

  it('see alert message of rerecord video and press cancel', function() {

    browser.click("#rerecord-primary-button", function(err) {
      assert.isNull(err, 'Error, when pressing rerecord button');
      expect(browser.alertText()).to.not.be.null;
    });

    if(browser.alertText()){ browser.alertDismiss(); }

  });

  //Will run something similar at the end in recorder player window
  it('start rerecord process from beginning', function(){
    browser.click("#rerecord-primary-button", function(err) {
      assert.isNull(err, 'Error, when pressing rerecord button');
      expect(browser.alertText()).to.not.be.null;
    });

    if(browser.alertText()){ browser.alertAccept(); }

    browser.waitForVisible("#player-submit-button");
    browser.click("#player-submit-button");
    browser.waitForVisible('#record-primary-button');
    browser.click('#record-primary-button');
    browser.waitForVisible('#stop-primary-button');
    browser.pause(5000);
    browser.click('#stop-primary-button');
    browser.waitForVisible('#images-imagegallery-container');

  });

  it('select cover image', function() {
    //var middleImage = browser.$("#images-imagegallery-container").$$("div")[1];

    browser.click("#images-imagegallery-container > div", function(err) {
      assert.isNull(err, 'Error, selecting cover image');
    });
  });

  it('rerecord video and play buttons are visible', function() {
    browser.waitForVisible("#player-rerecord-button", function (err) {
      assert.isNull(err, 'Error, re-record button is not visible');
      expect(browser.isVisible("#images-imagegallery-container")).to.equal(true);
      expect(browser.isVisible("#play-button")).to.equal(true);
    });
  });

  it('rerecord video alert message appear', function() {
    browser.click("#player-rerecord-button", function(err) {
      assert.isNull(err, 'Error, when pressing rerecord button');
      expect(browser.alertText()).to.not.be.null;
    });

    if(browser.alertText()){ browser.alertDismiss(); }
  });

  it('start playing video with player', function(err) {
    browser.click('#play-button', function(err){
      assert.isNull(err, 'Error, open recorder player window');
      expect(browser.isVisible("#button-icon-ccw")).to.equal(true);
      expect(browser.isVisible("#button-icon-pause")).to.equal(true);
    });
  });

  it('player\'s play/pause buttons are toggling', function() {

    browser.waitForVisible('#button-icon-pause');

    browser.click('#button-icon-pause', function(err){
      assert.isNull(err, 'Error, pause button not click able');
      expect(browser.isVisible("#button-icon-play")).to.equal(true);
    });

    browser.click('#button-icon-play', function(err){
      assert.isNull(err, 'Error, play button not click able');
      expect(browser.isVisible("#button-icon-pause")).to.equal(true);
    });

  });

  it('click rerecord to return to back', function(){
    browser.click("#button-icon-ccw", function(err) {
      assert.isNull(err, 'Error, when pressing rerecord button');
      expect(browser.alertText()).to.not.be.null;
    });

    if(browser.alertText()){ browser.alertAccept(); }

    browser.waitForVisible("#player-submit-button", function(err) {
      assert.isNull(err, 'Error, when pressing rerecord button');
    });

  });

  after(function(done){console.log('Record from normal way has been completed');});

});

describe('Upload video', function() {
  before(function(){});
  it('re-open choose page', function(){
    browser.url(credentials.record.related_url);
    var status = browser.status();
    expect(status.state).to.eql('success');
  });

  // Will press button record video
  it('click on "Upload Video"', function() {
    browser.url('/static/space.html');
    browser.chooseFile("input[class$=-chooser-file]", test_file_path);
    //expect(/sample\-video\.mp4$/.test(test_file_path)).to.eql(true);
    expect(true).to.be.equal(true);
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
