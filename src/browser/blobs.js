Scoped.define("module:Blobs", [], function() {
    return {

        createBlobByArrayBufferView: function(arrayBuffer, offset, size, type) {
            try {
                return new Blob([new DataView(arrayBuffer, offset, size)], {
                    type: type
                });
            } catch (e) {
                try {
                    return new Blob([new Uint8Array(arrayBuffer, offset, size)], {
                        type: type
                    });
                } catch (e) {
                    var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                    var bb = new BlobBuilder();
                    bb.append(arrayBuffer.slice(offset, offset + size));
                    return bb.getBlob(type);
                }
            }
        }

    };
});