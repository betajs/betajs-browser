Scoped.define("module:Upload.FileUploader", [
    "base:Classes.ConditionalInstance",
    "base:Events.EventsMixin",
    "base:Objs",
    "base:Types"
], function (ConditionalInstance, EventsMixin, Objs, Types, scoped) {
	return ConditionalInstance.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				// idle, uploading, success, error
				this._state = "idle";
			},
			
			_setState: function (state, triggerdata) {
				this._state = state;
				this.trigger(state, triggerdata);
				this.trigger("state", state, triggerdata);
			},
			
			state: function () {
				return this._state;
			},
			
			data: function () {
				return this._data;
			},
			
			progress: function () {
				return {
					uploaded: this._uploaded,
					total: this._total
				};
			},
			
			reset: function () {
				if (this.state() === "error") {
					this._setState("idle");
					delete this._data;
					delete this._uploaded;
					delete this._total;
				}
			},

			upload: function () {
				if (this.state() !== "idle")
					return this;
				this._setState("uploading");
				this.__upload();
				return this;
			},
			
			__upload: function () {
				this._options.resilience--;
				this._upload();
			},
			
			_upload: function () {},
			
			_progressCallback: function (uploaded, total) {
				if (this.state() !== "uploading")
					return;
				this._uploaded = uploaded;
				this._total = total;
				this.trigger("progress", uploaded, total);
			},
			
			_successCallback: function (data) {
				if (this.state() !== "uploading")
					return;
				this._data = data;
				this._setState("success", data);
			},
			
			_errorCallback: function (data) {
				if (this.state() !== "uploading")
					return;
				if (this._options.resilience > 0) {
					this.__upload();
					return;
				}
				if (!this._options.essential) {
					this._successCallback({});
					return;
				}
				this._data = data;
				this._setState("error", data);
			}
			
		};
	}], {
		
		_initializeOptions: function (options) {
			options = options || {};
			return Objs.extend({
				//url: "",
				//source: null,
				serverSupportChunked: false,
				serverSupportPostMessage: false,
				isBlob: typeof Blob !== "undefined" && options.source instanceof Blob,
				resilience: 1,
				essential: true,
				data: {}
			}, options);
		}
		
	});
});


Scoped.define("module:Upload.CustomUploader", [
	"module:Upload.FileUploader"
], function (FileUploader, scoped) {
	return FileUploader.extend({scoped: scoped}, {
	
		_upload: function () {
			this.trigger("upload", this._options);
		},
		
		progressCallback: function (uploaded, total) {
			this._progressCallback(uploaded, total);
		},
		
		successCallback: function (data) {
			this._successCallback(data);
		},
		
		errorCallback: function (data) {
			this._errorCallback(data);
		}
	
	});	
});