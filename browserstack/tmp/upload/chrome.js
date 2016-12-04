/**
 * Created by rashad on 12/1/16.
 */
var webdriver = require('selenium-webdriver');
var remote = require('selenium-webdriver/remote');
var fs = require('fs');

// Below credentials are Browserstack username and API key valuse
var credentials = require('../../../configurations/constants').browserstack;

// Test file for upload
var test_file_path = './files/sample-video.mp4';

// Input capabilities
var capabilities = {
  'build': credentials.version,
  'acceptSslCerts' : credentials.acceptSslCerts,
  'browserstack.debug' : credentials.debug,
  'browserstack.video' : credentials.videoRecord, // Record video in browserstack
  'browserstack.user': credentials.user,
  'browserstack.key': credentials.key,

  // Browser & OS Types
  'browserName' : 'Chrome',
  'browser_version' : '38.0',
  'os' : 'Windows',
  'os_version' : '7',
  'resolution' : '1024x768'
};

var driver = new webdriver.Builder()
  .usingServer('http://hub-cloud.browserstack.com/wd/hub')
  .withCapabilities(capabilities)
  .build();


webdriver.WebDriver.prototype.saveScreenshot = function(filename) {
  return driver.takeScreenshot().then(function(data) {
    fs.writeFile(filename, data.replace(/^data:image\/png;base64,/,''), 'base64', function(err) {
      if(err) throw err;
    });
  })
};

//This will detect your local file
driver.setFileDetector(new remote.FileDetector);

driver.get('http://www.fileconvoy.com/');
//File path specific to Linux
driver.findElement(webdriver.By.id('upfile_0')).sendKeys(test_file_path);
driver.findElement(webdriver.By.id('readTermsOfUse')).click();
driver.findElement(webdriver.By.id('upload_button')).click();

driver.getTitle().then(function(title) {
  console.log(title);
});

driver.quit();
