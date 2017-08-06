QUnit.test("standard file upload", function () {
	var done = assert.async();
    document.getElementById("qunit-fixture-visible").innerHTML = "<input type='file' name='file' /> <button id='upload-button'>Upload</button>";
	var file = document.querySelector("#qunit-fixture-visible input");
	document.getElementById('upload-button').onclick = function () {
		var identifier = BetaJS.Time.now();
		var uploader = BetaJS.Browser.Upload.FileUploader.create({
			url: FileServerUrl + "files/" + identifier,
			source: file,
			serverSupportPostMessage: true,
			serverSupportPostMessageId: true
		});
		uploader.on("success", function () {
			assert.ok(true, "Upload Successful");
			BetaJS.Ajax.Support.execute({
				uri: FileServerUrl + "files/" + identifier + "/size",
				method: "GET"
			}).success(function (result) {
				if (file.files)
					assert.equal(file.files[0].size, result.size, "size check");
				else
					assert.ok(true, "no size check");
				document.getElementById("qunit-fixture-visible").innerHTML = "";
				done();
			}).error(function (error) {
				assert.ok(false, error);
				done();
			});
		}).on("error", function (error) {
			assert.ok(false, error);
			done();
		});
		uploader.upload();
	};
});


QUnit.test("multi file upload", function () {
	var done = assert.async();
	var fileCount = 4;
	var files = [];
	var simul = 2;
	document.getElementById("qunit-fixture-visible").innerHTML = "";
	for (var i = 0; i < fileCount; ++i) {
		var file = document.querySelector("<input type='file' name='file' />");
        document.getElementById("qunit-fixture-visible").appendChild(file);
		files.push({
			id: i,
			file: file
		});
	}
    document.getElementById("qunit-fixture-visible").appendChild(BetaJS.Browser.Dom.elementByTemplate("<button id='upload-button'>Upload</button>"));
    document.getElementById('upload-button').onclick = function () {
		var identifier = BetaJS.Time.now();
		var uploader = new BetaJS.Browser.Upload.MultiUploader({
			uploadLimit: simul
		});
		files.forEach(function (item) {
			uploader.addUploader(BetaJS.Browser.Upload.FileUploader.create({
				url: FileServerUrl + "files/" + item.id + "-" + identifier,
				source: item.file,
				serverSupportPostMessage: true,
				serverSupportPostMessageId: true
			}));
		});
		uploader.on("success", function () {
			assert.ok(true, "Upload Successful");
			var doneCounter = fileCount;
			document.getElementById("qunit-fixture-visible").innerHTML = "";
			files.forEach(function (item) {
				BetaJS.Ajax.Support.execute({
					uri: FileServerUrl + "files/" + item.id + "-" + identifier + "/size",
					method: "GET"
				}).success(function (result) {
					if (item.file.files)
						assert.equal(item.file.files[0].size, result.size, "size check");
					else
						assert.ok(true, "no size check");
					doneCounter--;
					if (doneCounter === 0)
						done();
				}).error(function (error) {
					assert.ok(false, error);
					done();
				});
			});
		}).on("error", function (error) {
			assert.ok(false, error);
			done();
		});
		uploader.upload();
	};
});


if (BetaJS.Browser.Upload.ChunkedFileUploader.supported({serverSupportsChunked:true})) {
	test("chunked file upload", function () {
		var done = assert.async();
        document.getElementById("qunit-fixture-visible").innerHTML = "<input type='file' name='file' />";
		var file = document.querySelector("#qunit-fixture-visible input");
        document.getElementById("qunit-fixture-visible").appendChild(BetaJS.Browser.Dom.elementByTemplate("<button id='upload-button'>Upload</button>"));
        document.getElementById('upload-button').onclick = function () {
			var identifier = BetaJS.Time.now();
			var uploader = BetaJS.Browser.Upload.FileUploader.create({
				url: FileServerUrl + "chunk/" + identifier,
				source: file,
				serverSupportsChunked: true,
				uploadLimit: 4,
				chunks: {
					size: Math.round(file.files[0].size / 10)
				},
				assembly: {
					url: FileServerUrl + "assemble/" + identifier
				}
			});
			uploader.on("success", function () {
				assert.ok(true, "Upload Successful");
				BetaJS.Ajax.Support.execute({
					uri: FileServerUrl + "files/" + identifier + "/size",
					method: "GET"
				}).success(function (result) {
					assert.equal(file.files[0].size, result.size, "size check");
					document.getElementById("qunit-fixture-visible").innerHTML = "";
					done();
				}).error(function (error) {
					assert.ok(false, error);
					done();
				});
			}).on("error", function (error) {
				assert.ok(false, error);
				done();
			});
			uploader.upload();
		};
	});
} else {
	test("chunked file upload dummy", function () {
		var done = assert.async();
        document.getElementById("qunit-fixture-visible").innerHTML = "<input type='file' name='file' /> <button id='upload-button'>Upload</button>";
		var file = document.querySelector("#qunit-fixture-visible input");
        document.getElementById('upload-button').onclick = function () {
			var identifier = BetaJS.Time.now();
			var uploader = BetaJS.Browser.Upload.FileUploader.create({
				url: FileServerUrl + "files/" + identifier,
				source: file,
				serverSupportPostMessage: true,
				serverSupportPostMessageId: true
			});
			uploader.on("success", function () {
				assert.ok(true, "Upload Successful");
				BetaJS.Ajax.Support.execute({
					uri: FileServerUrl + "files/" + identifier + "/size",
					method: "GET"
				}).success(function (result) {
					if (file.files)
						assert.equal(file.files[0].size, result.size, "size check");
					else
						assert.ok(true, "no size check");
					document.getElementById("qunit-fixture-visible").innerHTML = "";
					done();
				}).error(function (error) {
					assert.ok(false, error);
					done();
				});
			}).on("error", function (error) {
				assert.ok(false, error);
				done();
			});
			uploader.upload();
		};
	});
}

if (BetaJS.Browser.Upload.ChunkedFileUploader.supported({serverSupportsChunked:true}) && BetaJS.Browser.Upload.StreamingFileUploader.supported({serverSupportsChunked:true})) {
	test("streaming file upload", function () {
		var done = assert.async();
        document.getElementById("qunit-fixture-visible").innerHTML = "<input type='file' name='file' />";
		var file = document.querySelector("#qunit-fixture-visible input");
        document.getElementById("qunit-fixture-visible").appendChild(BetaJS.Browser.Dom.elementByTemplate("<button id='upload-button'>Upload</button>"));
        document.getElementById('upload-button').onclick = function () {
			file = file.files[0];
			var identifier = BetaJS.Time.now();
			var uploader = new BetaJS.Browser.Upload.StreamingFileUploader({
				url: FileServerUrl + "chunk/" + identifier,
				uploadLimit: 4,
				assembly: {
					url: FileServerUrl + "assemble/" + identifier
				}
			});
			uploader.on("success", function () {
				assert.ok(true, "Upload Successful");
				BetaJS.Ajax.Support.execute({
					uri: FileServerUrl + "files/" + identifier + "/size",
					method: "GET"
				}).success(function (result) {
					assert.equal(file.size, result.size, "size check");
					document.getElementById("qunit-fixture-visible").innerHTML = "";
					done();
				}).error(function (error) {
					assert.ok(false, error);
					done();
				});
			}).on("error", function (error) {
				assert.ok(false, error);
				done();
			});
			uploader.upload();
			var fileReader = new FileReader();
			fileReader.onloadend = function (e) {
				var arrayBuffer = e.target.result;
				var chunkSize = Math.round(file.size / 10);
				var chunkNumber = 0;
				while (chunkNumber * chunkSize < file.size) {
					var offset = chunkNumber * chunkSize;
					var size = Math.min(chunkSize, file.size - offset);
					uploader.addChunk(BetaJS.Browser.Blobs.createBlobByArrayBufferView(arrayBuffer, offset, size, file.type));
					chunkNumber++;
				}
				uploader.end();
			};
			fileReader.readAsArrayBuffer(file);
		};
	});
} else {
	test("streaming file upload dummy", function () {
		var done = assert.async();
		document.getElementById("qunit-fixture-visible").innerHTML = "<input type='file' name='file' /> <button id='upload-button'>Upload</button>";
		var file = document.querySelector("#qunit-fixture-visible input");
        document.getElementById('upload-button').onclick = function () {
			var identifier = BetaJS.Time.now();
			var uploader = BetaJS.Browser.Upload.FileUploader.create({
				url: FileServerUrl + "files/" + identifier,
				source: file,
				serverSupportPostMessage: true,
				serverSupportPostMessageId: true
			});
			uploader.on("success", function () {
				assert.ok(true, "Upload Successful");
				BetaJS.Ajax.Support.execute({
					uri: FileServerUrl + "files/" + identifier + "/size",
					method: "GET"
				}).success(function (result) {
					if (file.files)
						assert.equal(file.files[0].size, result.size, "size check");
					else
						assert.ok(true, "no size check");
					document.getElementById("qunit-fixture-visible").innerHTML = "";
					done();
				}).error(function (error) {
					assert.ok(false, error);
					done();
				});
			}).on("error", function (error) {
				assert.ok(false, error);
				done();
			});
			uploader.upload();
		};
	});
}
