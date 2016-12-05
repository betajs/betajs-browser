test("standard file upload", function () {
	stop();
	$("#qunit-fixture-visible").html("<input type='file' name='file' />");
	var file = $("#qunit-fixture-visible input");
	file.on("change", function () {
		var identifier = BetaJS.Time.now();
		var uploader = BetaJS.Browser.Upload.FileUploader.create({
			url: FileServerUrl + "files/" + identifier,
			source: file.get(0),
			serverSupportPostMessage: true
		});
		uploader.on("success", function () {
			ok(true, "Upload Successful");
			BetaJS.Ajax.Support.execute({
				uri: FileServerUrl + "files/" + identifier + "/size",
				method: "GET"
			}).success(function (result) {
				if (file.get(0).files)
					QUnit.equal(file.get(0).files[0].size, result.size, "size check");
				$("#qunit-fixture-visible").html("");
				start();
			}).error(function (error) {
				ok(false, error);
				start();
			});
		}).on("error", function (error) {
			ok(false, error);
			start();
		});
		uploader.upload();
	});
});


if (!BetaJS.Browser.Info.isInternetExplorer() || BetaJS.Browser.Info.internetExplorerVersion() > 9) {
	// TODO: IFrame Uploader currently does not support concurrency
	test("multi file upload", function () {
		stop();
		var fileCount = 4;
		var files = [];
		var simul = 2;
		$("#qunit-fixture-visible").html("");
		for (var i = 0; i < fileCount; ++i) {
			var file = $("<input type='file' name='file" + i + "' />");
			$("#qunit-fixture-visible").append(file);
			files.push({
				id: i,
				file: file.get(0)
			});
		}
		$("#qunit-fixture-visible").append("<button id='upload-button'>Upload</button>");
		$("#upload-button").on("click", function () {
			var identifier = BetaJS.Time.now();
			var uploader = new BetaJS.Browser.Upload.MultiUploader({
				uploadLimit: simul
			});
			files.forEach(function (item) {
				uploader.addUploader(BetaJS.Browser.Upload.FileUploader.create({
					url: FileServerUrl + "files/" + item.id + "-" + identifier,
					source: item.file,
					serverSupportPostMessage: true
				}));
			});
			uploader.on("success", function () {
				ok(true, "Upload Successful");
				var doneCounter = fileCount;
				$("#qunit-fixture-visible").html("");
				files.forEach(function (item) {
					BetaJS.Ajax.Support.execute({
						uri: FileServerUrl + "files/" + item.id + "-" + identifier + "/size",
						method: "GET"
					}).success(function (result) {
						if (item.file.files)
							QUnit.equal(item.file.files[0].size, result.size, "size check");
						doneCounter--;
						if (doneCounter === 0)
							start();
					}).error(function (error) {
						ok(false, error);
						start();
					});
				});
			}).on("error", function (error) {
				ok(false, error);
				start();
			});
			uploader.upload();
		});
	});
}

if (BetaJS.Browser.Upload.ChunkedFileUploader.supported({serverSupportsChunked:true})) {
	test("chunked file upload", function () {
		stop();
		$("#qunit-fixture-visible").html("<input type='file' name='file' />");
		var file = $("#qunit-fixture-visible input");
		file.on("change", function () {
			var identifier = BetaJS.Time.now();
			var uploader = BetaJS.Browser.Upload.FileUploader.create({
				url: FileServerUrl + "chunk/" + identifier,
				source: file.get(0),
				serverSupportsChunked: true,
				uploadLimit: 4,
				chunks: {
					size: Math.round(file.get(0).files[0].size / 10)
				},
				assembly: {
					url: FileServerUrl + "assemble/" + identifier
				}
			});
			uploader.on("success", function () {
				ok(true, "Upload Successful");
				BetaJS.Ajax.Support.execute({
					uri: FileServerUrl + "files/" + identifier + "/size",
					method: "GET"
				}).success(function (result) {
					QUnit.equal(file.get(0).files[0].size, result.size, "size check");
					$("#qunit-fixture-visible").html("");
					start();
				}).error(function (error) {
					ok(false, error);
					start();
				});
			}).on("error", function (error) {
				ok(false, error);
				start();
			});
			uploader.upload();
		});
	});
}

if (BetaJS.Browser.Upload.StreamingFileUploader.supported({serverSupportsChunked:true})) {
	test("streaming file upload", function () {
		stop();
		$("#qunit-fixture-visible").html("<input type='file' name='file' />");
		var file = $("#qunit-fixture-visible input");
		file.on("change", function () {
			file = file.get(0).files[0];
			var identifier = BetaJS.Time.now();
			var uploader = new BetaJS.Browser.Upload.StreamingFileUploader({
				url: FileServerUrl + "chunk/" + identifier,
				uploadLimit: 4,
				assembly: {
					url: FileServerUrl + "assemble/" + identifier
				}
			});
			uploader.on("success", function () {
				ok(true, "Upload Successful");
				BetaJS.Ajax.Support.execute({
					uri: FileServerUrl + "files/" + identifier + "/size",
					method: "GET"
				}).success(function (result) {
					QUnit.equal(file.size, result.size, "size check");
					$("#qunit-fixture-visible").html("");
					start();
				}).error(function (error) {
					ok(false, error);
					start();
				});
			}).on("error", function (error) {
				ok(false, error);
				start();
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
		});
	});
}