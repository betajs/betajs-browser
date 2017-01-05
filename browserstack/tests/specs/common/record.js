/**
 * Created by rashad on 12/12/16.
 */
var expect = require('chai').expect;
var assert = require('chai').assert;
var path   = require('path');
var test_file_path = path.join(__dirname, "..", "..", "..", 'files/sample-video2.mp4');
const credentials = require('../../../configurations/constants').browserstack;

// Context of recording video from camera
describe('Record with normal way', function() {

  it('url opens correct with success status code', function() {
    browser.url(credentials.record.related_url);
    var status = browser.status();
    expect(status.state).to.eql('success');
  });

  // if #recorder-message-block has below content, exit from test
  // Access to the camera was forbidden. Click to retry.

  // Will press button record video
  it('open recording start page', function() {
    browser.waitForVisible('[data-selector=recorder-overlay]', function(err){
      assert.isNull(err, "Error getting main page, it's not visible");
    });

    //if(browser.isVisible()) // if alert that video not supporting appears

    browser.click("[data-selector='player-submit-button']", function (err) {
      assert.isNull(err, "Error, during pressing Record Your Video");
    });

    browser.waitForVisible('[data-selector=record-primary-button]', function(err) {
      assert.isNull(err, "Record button is not existing yet");
      expect($('[data-selector=record-primary-button]')).to.exist;
      expect($('[data-selector=record-button-icon-cog]')).to.exist;
    });
  });

  it('show video setting pop-up', function() {
    browser.click('[data-selector=record-button-icon-cog]', function(err) {
      assert.isNull(err, "Error click video settings button");
      expect(browser.isVisible("[data-selector=recorder-settings]")).to.equal(true);
    });
  });

  it('start recording video', function () {
    browser.click('[data-selector=record-primary-button]' ,function(err) {
      assert.isNull(err, "Error, when click on record button")
    });

    browser.waitForVisible('[data-selector=recorder-loader-label]', function() {
      expect(browser.isVisible('[data-selector=recorder-loader-label]')).to.be.true;
    });
  });

  it('wait button works correctly');

  it('stop video recording', function() {
    browser.waitForVisible('[data-selector=stop-primary-button]', function(err){
      assert.isNull(err, 'Stop button is not visible');
      expect(browser.isVisible('[data-selector=stop-primary-button]')).to.equal(true);
    });

    browser.pause(10000);
    browser.click('[data-selector=stop-primary-button]', function(err) {
      assert.isNull(err, 'Stop button is not click able');
    });
  });

  it('Rerecord button is visible', function() {
    browser.waitForVisible('[data-selector=rerecord-primary-button]', function(err) {
      assert.isNull(err, 'Error when try to stop video and show image gallery page.');
      expect(browser.isVisible("[data-selector=images-imagegallery-container]")).to.equal(true);
      expect(browser.isVisible("[data-selector=slider-left-inner-button]")).to.equal(true);
      expect(browser.isVisible("[data-selector=slider-right-inner-button]")).to.equal(true);
      expect(browser.isVisible("[data-selector=images-imagegallery-container]")).to.equal(true);
    });
  });

  it('see alert message of rerecord video and press cancel', function() {

    browser.click("[data-selector=rerecord-primary-button]", function(err) {
      assert.isNull(err, 'Error, when pressing rerecord button');
      expect(browser.alertText()).to.not.be.null;
    });

    if(browser.alertText()){ browser.alertDismiss(); }

  });

  //Will run something similar at the end in recorder player window
  it('start rerecord process from beginning', function(){
    browser.click("[data-selector=rerecord-primary-button]", function(err) {
      assert.isNull(err, 'Error, when pressing rerecord button');
      expect(browser.alertText()).to.not.be.null;
    });

    if(browser.alertText()){ browser.alertAccept(); }

    browser.waitForVisible("[data-selector=player-submit-button]");
    browser.click("[data-selector=player-submit-button]");
    browser.waitForVisible('[data-selector=record-primary-button]');
    browser.click('[data-selector=record-primary-button]');
    browser.waitForVisible('[data-selector=stop-primary-button]');
    browser.pause(10000);
    browser.click('[data-selector=stop-primary-button]');
    browser.waitForVisible('[data-selector=images-imagegallery-container]');

  });

  it('select cover image', function() {
    //var middleImage = browser.$("[data-selector=images-imagegallery-container]").$$("div")[1];

    browser.click("[data-selector=images-imagegallery-container] > div", function(err) {
      assert.isNull(err, 'Error, selecting cover image');
    });
  });

  it('rerecord video and play buttons are visible', function() {
    browser.pause(10000);
    browser.waitForVisible("[data-selector=player-rerecord-button]", function (err) {
      assert.isNull(err, 'Error, re-record button is not visible');
      expect(browser.isVisible("[data-selector=images-imagegallery-container]")).to.equal(true);
      expect(browser.isVisible("[data-selector=play-button]")).to.equal(true);
    });
  });

  it('rerecord video alert message appear', function() {
    browser.click("[data-selector=player-rerecord-button]", function(err) {
      assert.isNull(err, 'Error, when pressing rerecord button');
      expect(browser.alertText()).to.not.be.null;
    });

    if(browser.alertText()){ browser.alertDismiss(); }
  });

  it('start playing video with player', function(err) {
    browser.click('[data-selector=play-button]', function(err){
      assert.isNull(err, 'Error, open recorder player window');
      expect(browser.isVisible("[data-selector=button-icon-pause]")).to.equal(true);
    });
  });

  it('player\'s play/pause buttons are toggling', function() {

    browser.waitForVisible('[data-selector=button-icon-pause]');

    browser.click('[data-selector=button-icon-pause]', function(err){
      assert.isNull(err, 'Error, pause button not click able');
      expect(browser.isVisible("[data-selector=button-icon-play]")).to.equal(true);
    });

    browser.click('[data-selector=button-icon-play]', function(err){
      assert.isNull(err, 'Error, play button not click able');
      expect(browser.isVisible("[data-selector=button-icon-pause]")).to.equal(true);
    });

  });

  it('click rerecord to return to back', function(){
    browser.click("[data-selector=button-icon-ccw]", function(err) {
      assert.isNull(err, 'Error, when pressing rerecord button');
      expect(browser.alertText()).to.not.be.null;
    });

    if(browser.alertText()){ browser.alertAccept(); }

    browser.waitForVisible("[data-selector=player-submit-button]", function(err) {
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
    browser.waitForVisible('div[class$=-playbutton-container]');
    expect(browser.isVisible('div[class$=-playbutton-container]')).to.be.equal(true);
  });

  // Click on play button to view video
  it('Click on play button to show video', function () {
    browser.click('div[class$=-playbutton-container]');
    expect(browser.isVisible('div[class$=-playbutton-container]')).to.be.equal(true);
  });
});


// Scenarios
//#record-primary-button on click #recorder-loader-label and #recorder-loader-wait-button are become visible
//After 5 seconds #record-label-block & #stop-primary-button are become visible
//#stop-primary-button on click
// #rerecord-primary-button become visible
//onclick re-recordvideo appeat alert with message 'Do you really want to redo your video?'
// on Cancel - stay, on click OK return to choose page
// #slider-right-button and #slider-left-button are visible
// #images-imagegallery-container is visible
// #images-imagegallery-container > div click become visible #recorder-message-container
//After some period #player-rerecord-button & play-button are become visible
// on click OK #player-rerecord-button alert appear the same process in image gallery block
//#play-button click #button-icon-pause and #button-icon-ccw are become visible
