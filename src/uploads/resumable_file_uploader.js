
Scoped.define("module:Upload.ResumableFileUploader", [
    "module:Upload.FileUploader",
    "resumablejs:",
    "base:Async",
    "base:Objs",
    "base:Ajax.Support"
], function (FileUploader, ResumableJS, Async, Objs, AjaxSupport, scoped) {
	return FileUploader.extend({scoped: scoped}, {
		
		_upload: function () {
			this._resumable = new ResumableJS(Objs.extend({
				target: this._options.url,
				headers: this._options.data
			}, this._options.resumable));
			if (this._options.isBlob)
				this._options.source.fileName = "blob";
			this._resumable.addFile(this._options.isBlob ? this._options.source : this._options.source.files[0]);
			var self = this;
			this._resumable.on("fileProgress", function (file) {
				var size = self._resumable.getSize();
				self._progressCallback(Math.floor(self._resumable.progress() * size), size);
			});
			this._resumable.on("fileSuccess", function (file, message) {
				if (self._options.resumable.assembleUrl)
					self._resumableSuccessCallback(file, message, self._options.resumable.assembleResilience || 1);
				else
					self._successCallback(message);
			});
			this._resumable.on("fileError", function (file, message) {
				self._errorCallback(message);
			});
			Async.eventually(this._resumable.upload, this._resumable);
		},
		
		_resumableSuccessCallback: function (file, message, resilience) {
			if (resilience <= 0)
				this._errorCallback(message);
			AjaxSupport.execute({
				method: "POST",
				uri: this._options.resumable.assembleUrl,
				data: Objs.extend({
					resumableIdentifier: file.file.uniqueIdentifier,
					resumableFilename: file.file.fileName || file.file.name,
					resumableTotalSize: file.file.size,
					resumableType: file.file.type
				}, this._options.data)
			}).success(function () {
				this._successCallback(message);
			}, this).error(function (e) {
				if (this._options.resumable.acceptedAssembleError && this._options.resumable.acceptedAssembleError == e.status_code()) {
					this._successCallback(message);
					return;
				}
				Async.eventually(function () {
					this._resumableSuccessCallback(file, message, resilience - 1);
				}, this, this._options.resumable.assembleResilienceTimeout || 0);
			}, this);
		}
		
	}, {
		
		supported: function (options) {
			return options.serverSupportChunked && (new ResumableJS()).support;
		}
		
	});	
});

Scoped.extend("module:Upload.FileUploader", [
	"module:Upload.FileUploader",
	"module:Upload.ResumableFileUploader"
], function (FileUploader, ResumableFileUploader) {
 	FileUploader.register(ResumableFileUploader, 3);
 	return {};
});
