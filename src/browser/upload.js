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
				this._uploading = false;
			},

			upload: function () {
				this._uploading = true;
				this._options.resilience--;
				this._upload();
				this.trigger("uploading");
				return this;
			},
			
			_upload: function () {},
			
			_progressCallback: function (uploaded, total) {
				this.trigger("progress", uploaded, total);
			},
			
			_successCallback: function (data) {
				this._uploading = false;
				this.trigger("success", data);
			},
			
			_errorCallback: function (data) {
				this._uploading = false;
				this.trigger("error", data);
				if (this._options.resilience > 0)
					this.upload();
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
				resilience: 1
			}, options);
		}
		
	});
});


Scoped.define("module:Upload.MultiUploader", [
    "module:Upload.FileUploader",
    "base:Objs"
], function (FileUploader, Objs, scoped) {
	return FileUploader.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				this._uploaders = {};
				this._count = 0;
				this._success = 0;
				this._total = 0;
				this._uploaded = 0;
			},
			
			addUploader: function (uploader) {
				var entry = {
					uploader: uploader,
					success: false,
					data: null,
					uploaded: null,
					total: null
				};
				this._uploaders[uploader.cid()] = entry;
				this._count++;
				uploader.on("success", function (data) {
					this._success++;
					entry.success = true;
					entry.data = data;
					this._checkDone();
				}, this).on("error", function (data) {
					this._error++;
					entry.success = false;
					entry.data = data;
					this._checkDone();
				}, this).on("progress", function (uploaded, total) {
					if (entry.uploaded === null) {
						entry.uploaded = 0;
						entry.total = total;
						this._total += total;
					}
					this._uploaded += uploaded - entry.uploaded;
					entry.uploaded = uploaded;
					this._progressCallback(this._uploaded, this._total);
				}, this);
			},
			
			_upload: function () {
				this._error = 0;
				Objs.iter(this._uploaders, function (entry) {
					if (!entry.success) {
						this._uploaded -= entry.uploaded;
						this._total -= entry.total;
						entry.uploaded = null;
						entry.uploader.upload();
					}
				}, this);
			},
			
			_checkDone: function () {				
				if (this._success + this._error == this._count) {
					var datas = [];
					Objs.iter(this._uploaders, function (uploader) {
						datas.push(uploader.data);
					}, this);
					if (this._error === 0)
						this._successCallback(datas);
					else
						this._errorCallback(datas);
				}
			}
			
		};
	});
});


Scoped.define("module:Upload.FormDataFileUploader", [
    "module:Upload.FileUploader",
    "module:Info",
    "jquery:"
], function (FileUploader, Info, $, scoped) {
	var Cls = FileUploader.extend({scoped: scoped}, {
		
		_upload: function () {
			var self = this;
			var formData = new FormData();
        	formData.append("file", this._options.isBlob ? this._options.source : this._options.source.files[0]);
			$.ajax({
				type: "POST",
				async: true,
				url: this._options.url,
				data: formData,
    			cache: false,
    			contentType: false,
				processData: false,				
				xhr: function() {
		            var myXhr = $.ajaxSettings.xhr();
		            if (myXhr.upload) {
		                myXhr.upload.addEventListener('progress', function (e) {
							if (e.lengthComputable)
			                	self._progressCallback(e.loaded, e.total);
		                }, false);
		            }
		            return myXhr;
		        }
			}).success(function (data) {
				self._successCallback(data);
			}).error(function (data) {
				self._errorCallback(data);
			});
		}
		
	}, {
		
		supported: function (options) {
			if (Info.isInternetExplorer() && Info.internetExplorerVersion() <= 9)
				return false;
			try {
				new FormData();
			} catch (e) {
				return false;
			}
			return true;
		}
		
	});	
	
	FileUploader.register(Cls, 2);
	
	return Cls;
});



Scoped.define("module:Upload.FormIframeFileUploader", [
     "module:Upload.FileUploader",
     "jquery:",
     "base:Net.Uri",
     "json:"
], function (FileUploader, $, Uri, JSON, scoped) {
	var Cls = FileUploader.extend({scoped: scoped}, {
		
		_upload: function () {
			var self = this;
			var iframe = document.createElement("iframe");
			var id = "upload-iframe-" + this.cid();
			iframe.id = id;
			iframe.name = id;
			iframe.style.display = "none";
			var form = document.createElement("form");
			form.method = "POST";
			form.target = id;
			form.style.display = "none";
			document.body.appendChild(iframe);
			document.body.appendChild(form);
			var oldParent = this._options.source.parent;
			form.appendChild(this._options.source);
			var post_message_fallback = !("postMessage" in window);
			iframe.onerror = function () {
				if (post_message_fallback)
					window.postMessage = null;
				$(window).off("message." + self.cid());
				if (oldParent)
					oldParent.appendChild(this._options.source);
				document.body.removeChild(form);
				document.body.removeChild(iframe);
				self._errorCallback();
			};				
			form.action = Uri.appendUriParams(this._options.url, {"_postmessage": true});
			form.encoding = form.enctype = "multipart/form-data";
			var handle_success = function (raw_data) {
				if (post_message_fallback)
					window.postMessage = null;
				$(window).off("message." + self.cid());
				if (oldParent)
					oldParent.appendChild(this._options.source);
				var data = JSON.parse(raw_data);
				document.body.removeChild(form);
				document.body.removeChild(iframe);
				self._successCallback(data);
			};
			$(window).on("message." + this.cid(), function (event) {
				handle_success(event.originalEvent.data);
			});
			if (post_message_fallback) 
				window.postMessage = handle_success;
			form.submit();
		}
		
	}, {
		
		supported: function (options) {
			return !options.isBlob && options.serverSupportPostMessage;
		}
		
	});	
	
	FileUploader.register(Cls, 1);
	
	return Cls;
});



Scoped.define("module:Upload.ResumableFileUploader", [
    "module:Upload.FileUploader",
    "resumablejs:",
    "base:Async",
    "base:Objs",
    "jquery:"
], function (FileUploader, ResumableJS, Async, Objs, $, scoped) {
	var Cls = FileUploader.extend({scoped: scoped}, {
		
		_upload: function () {
			this._resumable = new ResumableJS(Objs.extend({
				target: this._options.url
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
			var self = this;
			$.ajax({
				type: "POST",
				async: true,
				url: this._options.resumable.assembleUrl,
				dataType: null, 
				data: {
					resumableIdentifier: file.file.uniqueIdentifier,
					resumableFilename: file.file.name,
					resumableTotalSize: file.file.size,
					resumableType: file.file.type
				},
				success: function (response) {
					self._successCallback(message);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					Async.eventually(function () {
						self._resumableSuccessCallback(file, message, resilience - 1);
					}, self._options.resumable.assembleResilienceTimeout || 0);
				}
			});
		}
		
	}, {
		
		supported: function (options) {
			return options.serverSupportChunked && (new ResumableJS()).support;
		}
		
	});	
	
	FileUploader.register(Cls, 3);
	
	return Cls;
});