Scoped.define("module:Blobs", [
    "base:Promise"
], function(Promise) {
    return {

        createBlobByArrayBufferView: function(arrayBuffer, offset, size, type) {
            try {
                return new(window.Blob)([new DataView(arrayBuffer, offset, size)], {
                    type: type
                });
            } catch (e) {
                try {
                    return new(window.Blob)([new Uint8Array(arrayBuffer, offset, size)], {
                        type: type
                    });
                } catch (e) {
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
                fileReader.onloadend = function(e) {
                    promise.asyncSuccess(e.target.result);
                };
                fileReader.readAsArrayBuffer(file.files ? file.files[0] : file);
            } catch (e) {
                promise.asyncError(e);
            }
            return e;
        },

        loadFileIntoString: function(file) {
            var promise = Promise.create();
            try {
                var fileReader = new FileReader();
                fileReader.onloadend = function(e) {
                    promise.asyncSuccess(e.target.result);
                };
                fileReader.readAsText(file.files ? file.files[0] : file);
            } catch (e) {
                promise.asyncError(e);
            }
            return e;
        }

    };
});