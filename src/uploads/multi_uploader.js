
Scoped.define("module:Upload.MultiUploader", [
    "module:Upload.FileUploader",
    "base:Objs"
], function (FileUploader, Objs, scoped) {
	return FileUploader.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				this._uploaders = {};
				this._uploadLimit = this._options.uploadLimit || 5;
				this._uploadingCount = 0;
				this._end = !this._options.manualEnd;
			},
			
			end: function () {
				this._end = true;
				this._updateState();
			},
			
			addUploader: function (uploader) {
				this._uploaders[uploader.cid()] = uploader;
				uploader.on("state", this._updateState, this);
				uploader.on("progress", this._updateProgress, this);
				if (this.state() === "uploading") {
					if (uploader.state() === "error")
						uploader.reset();
					if (uploader.state() === "idle" && this._uploadingCount < this._uploadLimit) {
						this._uploadingCount++;
						uploader.upload();
					}
				}
				return this;
			},
			
			_upload: function () {
				Objs.iter(this._uploaders, function (uploader) {
					if (uploader.state() === "error")
						uploader.reset();
					if (uploader.state() === "idle" && this._uploadingCount < this._uploadLimit) {
						this._uploadingCount++;
						uploader.upload();
					}
				}, this);
				this._updateState();
			},
			
			_updateState: function () {
				if (this.state() !== "uploading")
					return;
				this._uploadingCount = 0;
				var error = false;
				var idleCount = 0;
				Objs.iter(this._uploaders, function (uploader) {
					switch (uploader.state()) {
						case "uploading":
							this._uploadingCount++;
							break;
						case "error":
							error = true;
							break;
						case "idle":
							idleCount++;
							break;
					}
				}, this);
				if (idleCount > 0 && this._uploadingCount < this._uploadLimit) {
					Objs.iter(this._uploaders, function (uploader) {
						if (this._uploadingCount < this._uploadLimit && uploader.state() === "idle") {
							uploader.upload();
							idleCount--;
							this._uploadingCount++;
						}
					}, this);
				}
				if (this._uploadingCount > 0)
					return;
				if (!this._end)
					return;
				var datas = [];
				Objs.iter(this._uploaders, function (uploader) {
					var result = (error && uploader.state() === "error") || (!error && uploader.state() === "success") ? uploader.data() : undefined;
					datas.push(result);
				}, this);
				if (error > 0)
					this._errorCallback(datas);
				else
					this._successCallback(datas);
			},
			
			_updateProgress: function () {
				if (this.state() !== "uploading")
					return;
				this._progressCallback(this.uploadedBytes(), this.totalBytes());
			},
			
			uploadedBytes: function () {
				var uploaded = 0;
				Objs.iter(this._uploaders, function (uploader) {
					uploaded += uploader.uploadedBytes();
				}, this);
				return uploaded;
			},
			
			totalBytes: function () {
				var total = 0;
				Objs.iter(this._uploaders, function (uploader) {
					total += uploader.totalBytes();
				}, this);
				return total;
			}

		};
	});
});

