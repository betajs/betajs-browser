Scoped.define("module:Blobs", [], function() {
	return {

		createBlobByArrayBufferView : function(arrayBuffer, offset, size, type) {
			try {
				return new Blob([ new DataView(arrayBuffer, offset,size) ], {
					type : type
				});
			} catch (e) {
				return new Blob([ new Uint8Array(arrayBuffer, offset,size) ], {
					type : type
				});
			}

		}

	};
});