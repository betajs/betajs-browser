Different browsers require different techniques for asynchronously uploading of files and binary large objects (BLOBs).

This library takes care of that.
```javascript
    var uploader = BetaJS.Browser.Upload.FileUploader.create({
        url: "//.../post",
        source: file_object_or_blob,
        serverSupportChunked: false, // server supports chunked traffic via ResumableJS?
        serverSupportPostMessage: false, // server supports postMessage fallback for old browsers? 
        resumable: {
            // resumable options
        }               
    });
    uploader.on("success", function (data) {
        // success data from server
    }, this).on("error", function (data) {
        // error data from server
    }, this).on("progress", function (uploaded, total) {
        // progress data
    }, this);
    uploader.upload();
```

There is also support for uploading multiple files at once:
```javascript
    var multiUploader = new BetaJS.Browser.Upload.MultiUploader();
    multiUploader.addUploader(uploader1);
    multiUploader.addUploader(uploader2);
    multiUploader.addUploader(uploader3);
    multiUploader.upload();
```