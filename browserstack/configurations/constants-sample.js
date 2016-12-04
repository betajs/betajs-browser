module.exports = {
  browserstack : {
    "version": "",
    "user": "",
    "key": "",
    "bas_url": "http://localhost:6001",
    "related_url": "/static/space.html",
    "local_test": true,
    "host" : 'http://hub-cloud.browserstack.com',
    "port": 80,
    "path": '/wd/hub',
    "acceptSslCerts" : true,
    "debug": true,
    "videoRecord": false,
    "ie" : {
      "noFlash" : true,  // Disable Flash in IE
      "enablePopups" : true
    }
  }
};
