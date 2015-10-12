/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/

Scoped.define("module:FlashDetect", ["base:Class"], function (Class, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function () {
				inherited.constructor.call(this);
				this.__version = null;
		        if (navigator.plugins && navigator.plugins.length > 0) {
		            var type = 'application/x-shockwave-flash';
		            var mimeTypes = navigator.mimeTypes;
		            if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description)
		                this.__version = this.parseVersion(mimeTypes[type].enabledPlugin.description);
		        } else if (navigator.appVersion.indexOf("Mac") == -1 && "execScript" in window) {
		            for (var i = 0; i < this.__activeXDetectRules.length; i++) {
				        try {
				            var obj = new ActiveXObject(this.__activeXDetectRules[i].name);
				            var version = this.__activeXDetectRules[i].version(obj);
		                    if (version) {
		                    	this.__version = this.parseActiveXVersion(version);
		                    	break;
		                    }
				        } catch (err) { }
				    }
				}
			},
			
		    parseVersion: function(str) {
		        var descParts = str.split(/ +/);
		        var majorMinor = descParts[2].split(/\./);
		        var revisionStr = descParts[3];
		        return {
		            "raw": str,
		            "major": parseInt(majorMinor[0], 10),
		            "minor": parseInt(majorMinor[1], 10), 
		            "revisionStr": revisionStr,
		            "revision": parseInt(revisionStr.replace(/[a-zA-Z]/g, ""), 10)
		        };
		    },
			
		    parseActiveXVersion : function(str) {
		        var versionArray = str.split(",");
		        return {
		            "raw": str,
		            "major": parseInt(versionArray[0].split(" ")[1], 10),
		            "minor": parseInt(versionArray[1], 10),
		            "revision": parseInt(versionArray[2], 10),
		            "revisionStr": versionArray[2]
		        };
		    },
			
			version: function () {
				return this.__version;
			},
			
			installed: function () {
				return this.__version !== null;
			},
			
			supported: function () {
				var ua = navigator.userAgent;
				return this.installed() || !(ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1 || ua.indexOf('iPad') != -1);
			},
			
		    majorAtLeast : function (version) {
		        return this.installed() && this.version().major >= version;
		    },
		
		    minorAtLeast : function (version) {
		        return this.installed() && this.version().minor >= version;
		    },
		
		    revisionAtLeast : function (version) {
		        return this.installed() && this.version().revision >= version;
		    },
		
		    versionAtLeast : function (major) {
		    	if (!this.installed())
		    		return false;
		        var properties = [this.version().major, this.version().minor, this.version().revision];
		        var len = Math.min(properties.length, arguments.length);
		        for (var i = 0; i < len; i++) {
		            if (properties[i] != arguments[i]) 
		            	return properties[i] > arguments[i];
		        }
		        return true;
		    },
			
		    __activeXDetectRules: [{
		        name: "ShockwaveFlash.ShockwaveFlash.7",
		        version: function(obj) {
			        try {
			            return obj.GetVariable("$version");
			        } catch(err) {
			        	return null;
			        }
			    }
			}, {
				name: "ShockwaveFlash.ShockwaveFlash.6",
		        version: function(obj) {
		            try {
		                obj.AllowScriptAccess = "always";
				        try {
				            return obj.GetVariable("$version");
				        } catch(err) {
				        	return null;
				        }
		            } catch(err) {
		            	return "6,0,21";
		            }
		        }
			}, {
				name: "ShockwaveFlash.ShockwaveFlash",
				version: function(obj) {
			        try {
			            return obj.GetVariable("$version");
			        } catch(err) {
			        	return null;
			        }
		        }
		    }]
		    
		};
	});
});


Scoped.define("module:FlashHelper", [
    "base:Time", "base:Objs", "base:Types", "base:Net.Uri", "module:Info", "jquery:"
], function (Time, Objs, Types, Uri, Info, $) {
	return {
		
		getFlashObject: function (container) {
			var embed = $(container).find("embed").get(0);
			if (Info.isInternetExplorer() && Info.internetExplorerVersion() <= 10)
				embed = null;
			if (!embed)
				embed = $(container).find("object").get(0);
			if (!embed) {
				var objs = $("object");
				for (var i = 0; i < objs.length; ++i) {
					if ($(objs[i]).closest(container).length > 0)
						embed = $(objs[i]).get(0);
				}
			}
			return embed;
		},
		
		embedTemplate: function (options) {
			options = options || {};
			var params = [];
			params.push({
				"objectKey": "classid",
				"value": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
			});
			params.push({
				"objectKey": "codebase",
				"value": "http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab"
			});
			params.push({
				"embedKey": "align",
				"value": "middle"
			});
			params.push({
				"embedKey": "play",
				"value": "true"
			});
			params.push({
				"embedKey": "loop",
				"value": "false"
			});
			params.push({
				"embedKey": "type",
				"value": "application/x-shockwave-flash"
			});
			params.push({
				"embedKey": "pluginspage",
				"value": "http://www.adobe.com/go/getflashplayer"
			});
			params.push({
				"objectParam": "quality",
				"embedKey": "quality",
				"value": "high"
			});
			params.push({
				"objectParam": "allowScriptAccess",
				"embedKey": "allowScriptAccess",
				"value": "always"
			});
			params.push({
				"objectParam": "wmode",
				"embedKey": "wmode",
				"value": "opaque"
			});
			params.push({
				"objectParam": "movie",
				"embedKey": "src",
				"value": options.flashFile + (options.forceReload ? "?" + Time.now() : "") 
			});
			if (options.width) {
				params.push({
					"objectKey": "width",
					"embedKey": "width",
					"value": options.width
				});
			}
			if (options.height) {
				params.push({
					"objectKey": "height",
					"embedKey": "height",
					"value": options.height
				});
			}
			if (options.bgcolor) {
				params.push({
					"objectParam": "bgcolor",
					"embedKey": "bgcolor",
					"value": options.bgcolor
				});
			}
			if (options.FlashVars) {
				params.push({
					"objectParam": "FlashVars",
					"embedKey": "FlashVars",
					"value": Types.is_object(options.FlashVars) ? Uri.encodeUriParams(options.FlashVars) : options.FlashVars
				});
			}
			if (options.objectId) {
				params.push({
					"objectKey": "id",
					"value": options.objectId
				});
			}
			var objectKeys = [];
			var objectParams = [];
			var embedKeys = [];
			Objs.iter(params, function (param) {
				if (param.objectKey)
					objectKeys.push(param.objectKey + '="' + param.value + '"');
				if (param.embedKey)
					embedKeys.push(param.embedKey + '="' + param.value + '"');
				if (param.objectParam)
					objectParams.push('<param name="' + param.objectParam + '" value="' + param.value + '" />');
			}, this);
			return "<object " + objectKeys.join(" ") + ">" + objectParams.join(" ") + "<embed " + embedKeys.join(" ") + "></embed></object>";
		},
		
		embedFlashObject: function (container, options) {
			options = options || {};
			var $container = $(container);
			if (options.parentBgcolor) {
				try {
					var hex = $container.css("background-color");
					if (hex.indexOf("rgb") >= 0) {
						var rgb = hex.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
					    var convert = function (x) {
					        return ("0" + parseInt(x, 10).toString(16)).slice(-2);
					    };
					    if (rgb && rgb.length > 3)
					    	hex = "#" + convert(rgb[1]) + convert(rgb[2]) + convert(rgb[3]);
					}
					options.bgcolor = hex;
				} catch (e) {}
			}
			if (options.fixHalfPixels) {
				try {
					var offset = $container.offset();
					if (offset.top % 1 !== 0)
						$container.css("margin-top", (Math.round(offset.top) - offset.top) + "px");
					if (offset.left % 1 !== 0)
						$container.css("margin-left", (Math.round(offset.left) - offset.left) + "px");
				} catch (e) {}
			}
			$container.html(this.embedTemplate(options));
			return this.getFlashObject(container);
		}
		
	};	
});
