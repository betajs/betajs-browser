/**
 * Created by rashad on 12/9/16.
 */

var webdriver = require('selenium-webdriver');
var remote = require('selenium-webdriver/remote');
var fs = require('fs');

// Below credentials are Browserstack username and API key valuse
var credentials = require('../../configurations/constants').browserstack;
var test_file_path = path.join(__dirname, "..", "..", 'files/sample-video2.mp4');

// Input capabilities
var capabilities = {
  'build': 'selenium_webdriver',
  'project': 'test_with_edge_in_win_10',
  'acceptSslCerts' : credentials.acceptSslCerts,
  'browserstack.debug' : credentials.debug,
  'browserstack.video' : credentials.videoRecord, // Record video in browserstack
  'browserstack.user': credentials.user,
  'browserstack.key': credentials.key,
  'browserstack.local' : true,

  // Browser & OS Types
  'browserName' : 'edge', //EDGE
  'os' : 'Windows',
  'os_version' : '10',
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

driver.get(credentials.upload.bas_url + credentials.upload.related_url);

//File path specific to Linux
driver.findElement(webdriver.By.css('#qunit-fixture-visible input[type=file]'))
  .sendKeys(test_file_path);
driver.findElement(webdriver.By.id('upload-button')).click();


driver.quit();
