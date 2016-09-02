
Scoped.define("module:Upload.MultiUploader", [
    "module:Upload.FileUploader",
    "base:Objs"
], function (FileUploader, Objs, scoped) {
	return FileUploader.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				this._uploaders = {};
			},
			
			addUploader: function (uploader) {
				this._uploaders[uploader.cid()] = uploader;
				uploader.on("state", this._updateState, this);
				uploader.on("progress", this._updateProgress, this);
				if (this.state() === "uploading") {
					if (uploader.state() === "error")
						uploader.reset();
					if (uploader.state() === "idle")
						uploader.upload();
				}
				return this;
			},
			
			_upload: function () {
				Objs.iter(this._uploaders, function (uploader) {
					if (uploader.state() === "error")
						uploader.reset();
					if (uploader.state() === "idle")
						uploader.upload();
				}, this);
				this._updateState();
			},
			
			_updateState: function () {
				if (this.state() !== "uploading")
					return;
				var success = 0;
				var error = false;
				var uploading = false;
				Objs.iter(this._uploaders, function (uploader) {
					uploading = uploading || uploader.state() === "uploading";
					error = error || uploader.state() === "error";
				}, this);
				if (uploading)
					return;
				var datas = [];
				Objs.iter(this._uploaders, function (uploader) {
					var result = (error && uploader.state() === "error") || (!error && uploader.state() === "success") ? uploader.data() : undefined;
					datas.push(result);
				}, this);
				if (error)
					this._errorCallback(datas);
				else
					this._successCallback(datas);
			},
			
			_updateProgress: function () {
				if (this.state() !== "uploading")
					return;
				var total = 0;
				var uploaded = 0;
				Objs.iter(this._uploaders, function (uploader) {
					var state = uploader.state();
					var progress = uploader.progress();
					if (progress && progress.total) {
						if (uploader.state() === "success") {
							total += progress.total;
							uploaded += progress.total;
						}
						if (uploader.state() === "uploading") {
							total += progress.total;
							uploaded += progress.uploaded;
						}
					}
				}, this);
				this._progressCallback(uploaded, total);
			}

		};
	});
});

