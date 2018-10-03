Scoped.define("module:Blobs", [
    "base:Promise"
], function(Promise) {
    return {

        createBlobByArrayBufferView: function(arrayBuffer, offset, size, type) {
            try {
                return new(window.Blob)([new DataView(arrayBuffer, offset, size)], {
                    type: type
                });
            } catch (err) {
                try {
                    return new(window.Blob)([new Uint8Array(arrayBuffer, offset, size)], {
                        type: type
                    });
                } catch (err2) {
                    var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                    var bb = new BlobBuilder();
                    bb.append(arrayBuffer.slice(offset, offset + size));
                    return bb.getBlob(type);
                }
            }
        },

        loadFileIntoArrayBuffer: function(file) {
            var promise = Promise.create();
            try {
                var fileReader = new FileReader();
                fileReader.onloadend = function(ev) {
                    promise.asyncSuccess(ev.target.result);
                };
                fileReader.readAsArrayBuffer(file.files ? file.files[0] : file);
            } catch (err) {
                promise.asyncError(err);
            }
            return promise;
        },

        loadFileIntoString: function(file) {
            var promise = Promise.create();
            try {
                var fileReader = new FileReader();
                fileReader.onloadend = function(ev) {
                    promise.asyncSuccess(ev.target.result);
                };
                fileReader.readAsText(file.files ? file.files[0] : file);
            } catch (err) {
                promise.asyncError(err);
            }
            return promise;
        }

    };
});