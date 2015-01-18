/*!
betajs-browser - v1.0.0 - 2015-01-17
Copyright (c) Oliver Friedmann
MIT Software License.
*/
BetaJS.Net.AbstractAjax.extend("BetaJS.Browser.JQueryAjax", {
	
	_syncCall: function (options) {
		var result;
		BetaJS.$.ajax({
			type: options.method,
			async: false,
			url: options.uri,
			dataType: options.decodeType ? options.decodeType : null, 
			data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
			success: function (response) {
				result = response;
			},
			error: function (jqXHR, textStatus, errorThrown) {
				var err = "";
				try {
					err = JSON.parse(jqXHR.responseText);
				} catch (e) {
					err = JSON.parse('"' + jqXHR.responseText + '"');
				}
				throw new BetaJS.Net.AjaxException(jqXHR.status, errorThrown, ee);
			}
		});
		return result;
	},
	
	_asyncCall: function (options, callbacks) {
		var promise = BetaJS.Promise.create();
		if (BetaJS.Browser.Info.isInternetExplorer() && BetaJS.Browser.Info.internetExplorerVersion() <= 9)
			BetaJS.$.support.cors = true;
		BetaJS.$.ajax({
			type: options.method,
			async: true,
			url: options.uri,
			dataType: options.decodeType ? options.decodeType : null, 
			data: options.encodeType && options.encodeType == "json" ? JSON.stringify(options.data) : options.data,
			success: function (response) {
				promise.asyncSuccess(response);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				var err = "";
				try {
					err = JSON.parse(jqXHR.responseText);
				} catch (e) {
					err = JSON.parse('"' + jqXHR.responseText + '"');
				}
				promise.asyncError(new BetaJS.Net.AjaxException(jqXHR.status, errorThrown, err));
			}
		});
		return promise;
	}

});

BetaJS.Browser.Cookies = {

	get : function(key) {
		return BetaJS.Strings.read_cookie_string(document.cookie, key);
	},

	set : function(key, value) {
		document.cookie = BetaJS.Strings.write_cookie_string(document.cookie, key, value);
	}
};
BetaJS.Browser.Dom = {
	
	traverseNext: function (node, skip_children) {
		if ("get" in node)
			node = node.get(0);
		if (node.firstChild && !skip_children)
			return BetaJS.$(node.firstChild);
		if (!node.parentNode)
			return null;
		if (node.nextSibling)
			return BetaJS.$(node.nextSibling);
		return this.traverseNext(node.parentNode, true);
	},
	
	selectNode : function(node, offset) {
		node = BetaJS.$(node).get(0);
		var selection = null;
		var range = null;
		if (window.getSelection) {
			selection = window.getSelection();
			selection.removeAllRanges();
			range = document.createRange();
		} else if (document.selection) {
			selection = document.selection;
			range = selection.createRange();
		}
		if (offset) {
			range.setStart(node, offset);
			range.setEnd(node, offset);
			selection.addRange(range);
		} else {
			range.selectNode(node);
			selection.addRange(range);
		}
	},

	selectionStartNode : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},
	
	selectedHtml : function() {
		if (window.getSelection)
			return window.getSelection().toString();
		else if (document.selection)
			return document.selection.createRange().htmlText;
		return "";
	},
	
	selectionAncestor : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).commonAncestorContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().parentElement());
		return null;
	},
	
	selectionStartOffset: function () {
		if (window.getSelection)
			return window.getSelection().getRangeAt(0).startOffset;
		else if (document.selection)
			return document.selection.createRange().startOffset;
		return null;
	},
	
	selectionEndOffset: function () {
		if (window.getSelection)
			return window.getSelection().getRangeAt(0).endOffset;
		else if (document.selection)
			return document.selection.createRange().endOffset;
		return null;
	},

	selectionStart : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).startContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().startContainer);
		return null;
	},

	selectionEnd : function() {
		if (window.getSelection)
			return BetaJS.$(window.getSelection().getRangeAt(0).endContainer);
		else if (document.selection)
			return BetaJS.$(document.selection.createRange().endContainer);
		return null;
	},
	
	selectionNonEmpty: function () {
		var start = this.selectionStart();
		var end = this.selectionEnd();
		return start && end && start.get(0) && end.get(0) && (start.get(0) != end.get(0) || this.selectionStartOffset() != this.selectionEndOffset());
	},
	
	selectionContained: function (node) {
		return node.has(this.selectionStart()).length > 0 && node.has(this.selectionEnd()).length > 0;
	},

	selectionNodes: function () {
		var result = [];
		var start = this.selectionStart();
		var end = this.selectionEnd();
		result.push(start);
		var current = start;
		while (current.get(0) != end.get(0)) {
			current = this.traverseNext(current);
			result.push(current);
		}
		return result;
	},
	
	selectionLeaves: function () {
		return BetaJS.Objs.filter(this.selectionNodes(), function (node) { return node.children().length === 0; });
	},
	
	contentSiblings: function (node) {
		return node.parent().contents().filter(function () {
			return this != node.get(0);
		});
	},
	
	remove_tag_from_parent_path: function (node, tag, context) {	
		tag = tag.toLowerCase();
		node = BetaJS.$(node);
		var parents = node.parents(context ? context + " " + tag : tag);
		for (var i = 0; i < parents.length; ++i) {
			var parent = parents.get(i);
			parent = BetaJS.$(parent);
			while (node.get(0) != parent.get(0)) {
				this.contentSiblings(node).wrap("<" + tag + "></" + tag + ">");
				node = node.parent();
			}
			parent.contents().unwrap();
		}
	},
	
	selectionSplitOffsets: function () {
		var startOffset = this.selectionStartOffset();
		var endOffset = this.selectionEndOffset();
		var start = this.selectionStart();
		var end = this.selectionEnd();
		var single = start.get(0) == end.get(0);
		if (endOffset < end.get(0).wholeText.length) {
			var endElem = end.get(0);
			endElem.splitText(endOffset);
			end = BetaJS.$(endElem);
			if (single)
				start = end;
		}
		if (startOffset > 0) {
			start = BetaJS.$(start.get(0).splitText(startOffset));
			if (single)
				end = start;
		}
		this.selectRange(start, end);
	},
	
	selectRange: function (start_node, end_node, start_offset, end_offset) {
		start_node = BetaJS.$(start_node);
		end_node = BetaJS.$(end_node);
		var selection = null;
		var range = null;
		if (window.getSelection) {
			selection = window.getSelection();
			selection.removeAllRanges();
			range = document.createRange();
		} else if (document.selection) {
			selection = document.selection;
			range = selection.createRange();
		}
		range.setStart(start_node.get(0), start_offset || 0);
		range.setEnd(end_node.get(0), end_offset || end_node.get(0).data.length);
		selection.addRange(range);
	},
	
	splitNode: function (node, start_offset, end_offset) {
		node = BetaJS.$(node);
		start_offset = start_offset || 0;
		end_offset = end_offset || node.get(0).data.length;
		if (end_offset < node.get(0).data.length) {
			var elem = node.get(0);
			elem.splitText(end_offset);
			node = BetaJS.$(elem);
		}
		if (start_offset > 0) 
			node = BetaJS.$(node.get(0).splitText(start_offset));
		return node;
	}
			
};

BetaJS.Browser = BetaJS.Browser || {};

/**
 * Uses modified portions of:
 * 
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */

BetaJS.Browser.Hotkeys = {
	
	SHIFT_NUMS: {
		"`":"~",
		"1":"!",
		"2":"@",
		"3":"#",
		"4":"$",
		"5":"%",
		"6":"^",
		"7":"&",
		"8":"*",
		"9":"(",
		"0":")",
		"-":"_",
		"=":"+",
		";":":",
		"'":"\"",
		",":"<",
		".":">",
		"/":"?",
		"\\":"|"
	},
	
	SPECIAL_KEYS: {
		'esc':27,
		'escape':27,
		'tab':9,
		'space':32,
		'return':13,
		'enter':13,
		'backspace':8,

		'scrolllock':145,
		'scroll_lock':145,
		'scroll':145,
		'capslock':20,
		'caps_lock':20,
		'caps':20,
		'numlock':144,
		'num_lock':144,
		'num':144,
		
		'pause':19,
		'break':19,
		
		'insert':45,
		'home':36,
		'delete':46,
		'end':35,
		
		'pageup':33,
		'page_up':33,
		'pu':33,

		'pagedown':34,
		'page_down':34,
		'pd':34,

		'left':37,
		'up':38,
		'right':39,
		'down':40,

		'f1':112,
		'f2':113,
		'f3':114,
		'f4':115,
		'f5':116,
		'f6':117,
		'f7':118,
		'f8':119,
		'f9':120,
		'f10':121,
		'f11':122,
		'f12':123
	},
	
	MODIFIERS: ["ctrl", "alt", "shift", "meta"],
	
	keyCodeToCharacter: function (code) {
		if (code == 188)
			return ",";
		else if (code == 190)
			return ".";
		return String.fromCharCode(code).toLowerCase();
	},
	
	register: function (hotkey, callback, context, options) {
		options = BetaJS.Objs.extend({
			"type": "keyup",
			"propagate": false,
			"disable_in_input": false,
			"target": document,
			"keycode": false
		}, options);
		options.target = BetaJS.$(options.target);
		var keys = hotkey.toLowerCase().split("+");
		var func = function (e) {
			if (options.disable_in_input) {
				var element = e.target || e.srcElement || null;
				if (element && element.nodeType == 3)
					element = element.parentNode;
				if (element && (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA'))
					return;
			}
			var code = e.keyCode || e.which || 0;
			var character = BetaJS.Browser.Hotkeys.keyCodeToCharacter(code);
			var kp = 0;
			var modifier_map = {};
			BetaJS.Objs.iter(BetaJS.Browser.Hotkeys.MODIFIERS, function (mod) {
				modifier_map[mod] = {
					pressed: e[mod + "Key"],
					wanted: false
				};
			}, this);
			BetaJS.Objs.iter(keys, function (key) {
				if (key in modifier_map) {
					modifier_map[key].wanted = true;
					kp++;
				} else if (key.length > 1) {
					if (BetaJS.Browser.Hotkeys.SPECIAL_KEYS[key] == code)
						kp++;
				} else if (options.keycode) {
					if (options.keycode == code)
						kp++;
				} else if (character == key || (e.shiftKey && BetaJS.Browser.Hotkeys.SHIFT_NUMS[character] == key)) {
					kp++;
				}
			}, this);
			if (kp == keys.length && BetaJS.Objs.all(modifier_map, function (data) { return data.wanted == data.pressed; })) {
				callback.apply(context || this);
				if (!options.propagate)
					e.preventDefault();
			}
		};
		options.target.on(options.type, func);
		return {
			target: options.target,
			type: options.type,
			func: func
		};
	},
	
	unregister: function (handle) {
		handle.target.off(handle.type, handle.func);
	} 
	
};

BetaJS.Browser = BetaJS.Browser || {};

BetaJS.Browser.Info = {
	
	getNavigator: function () {
		return {
			appCodeName: navigator.appCodeName,
			appName: navigator.appName,
			appVersion: navigator.appVersion,
			cookieEnabled: navigator.cookieEnabled,
			onLine: navigator.onLine,
			platform: navigator.platform,
			userAgent: navigator.userAgent
		};
	},
	
	__cache: {},
	
	__cached: function (key, value_func) {
		if (!(key in this.__cache))
			this.__cache[key] = value_func.apply(this);
		return this.__cache[key];
	},

	flash: function () {
		return this.__cached("flash", function () {
			return new BetaJS.Browser.FlashDetect();
		});
	},
	
	isiOS: function () {
		return this.__cached("isiOS", function () {
			var ua = navigator.userAgent;
			return ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1 || ua.indexOf('iPad') != -1;
		});
	},
	
	isChrome: function () {
		return this.__cached("isChrome", function () {
			return ("chrome" in window || navigator.userAgent.indexOf('CriOS') != -1)  && !window.opera && navigator.userAgent.indexOf(' OPR/') === -1;
		});
	},
	
	isOpera: function () {
		return this.__cached("isOpera", function () {
			return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		});
	},
	
	isAndroid: function () {
		return this.__cached("isAndroid", function () {
			return navigator.userAgent.toLowerCase().indexOf("android") != -1;
		});
	},
	
	isWebOS: function () {
		return this.__cached("isWebOS", function () {
			return navigator.userAgent.toLowerCase().indexOf("webos") != -1;
		});
	},

	isWindowsPhone: function () {
		return this.__cached("isWindowsPhone", function () {
			return navigator.userAgent.toLowerCase().indexOf("windows phone") != -1;
		});
	},

	isBlackberry: function () {
		return this.__cached("isBlackberry", function () {
			return navigator.userAgent.toLowerCase().indexOf("blackberry") != -1;
		});
	},

	iOSversion: function () {
		return this.__cached("iOSversion", function () {
			if (!this.isiOS())
				return false;
		    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		    return {
		    	major: parseInt(v[1], 10),
		    	minor: parseInt(v[2], 10),
		    	revision: parseInt(v[3] || 0, 10)
		    };
		});
	},
	
	isMobile: function () {
		return this.__cached("isMobile", function () {
			return this.isiOS() || this.isAndroid() || this.isWebOS() || this.isWindowsPhone() || this.isBlackberry();
		});
	},
	
	isInternetExplorer: function () {
		return this.__cached("isInternetExplorer", function () {
			//return navigator.appName == 'Microsoft Internet Explorer';
			return this.internetExplorerVersion() !== null;
		});
	},
	
	isFirefox: function () {
		return this.__cached("isFirefox", function () {
			return navigator.userAgent.toLowerCase().indexOf("firefox") != -1;
		});
	},
	
	isSafari: function () {
		return this.__cached("isSafari", function () {
			return !this.isChrome() && navigator.userAgent.toLowerCase().indexOf("safari") != -1;
		});
	},
	
	isWindows: function () {
		return this.__cached("isWindows", function () {
			return navigator.appVersion.toLowerCase().indexOf("win") != -1;
		});
	},
	
	isMacOS: function () {
		return this.__cached("isMacOS", function () {
			return navigator.appVersion.toLowerCase().indexOf("mac") != -1;
		});
	},
	
	isUnix: function () {
		return this.__cached("isUnix", function () {
			return navigator.appVersion.toLowerCase().indexOf("x11") != -1;
		});
	},
	
	isLinux: function () {
		return this.__cached("isLinux", function () {
			return navigator.appVersion.toLowerCase().indexOf("linux") != -1;
		});
	},
	
	internetExplorerVersion: function () {
		if (navigator.appName == 'Microsoft Internet Explorer') {
		    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		    if (re.exec(navigator.userAgent))
		    	return parseFloat(RegExp.$1);
		} else if (navigator.appName == 'Netscape') {
		    var re2 = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
		    if (re2.exec(navigator.userAgent))
		    	return parseFloat(RegExp.$1);
		}
		return null;
	},
	
	inIframe: function () {
	    try {
	        return window.self !== window.top;
	    } catch (e) {
	        return true;
	    }
	}
	
};




/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/

BetaJS.Class.extend("BetaJS.Browser.FlashDetect", {
	
	constructor: function () {
		this._inherited(BetaJS.Browser.FlashDetect, "constructor");
		this.__version = null;
        if (navigator.plugins && navigator.plugins.length > 0) {
            var type = 'application/x-shockwave-flash';
            var mimeTypes = navigator.mimeTypes;
            if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description)
                this.__version = this.parseVersion(mimeTypes[type].enabledPlugin.description);
        } else if (navigator.appVersion.indexOf("Mac") == -1 && window.execScript) {
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
		return this.installed() || !BetaJS.Browser.Info.isiOS();
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
        for (i = 0; i < len; i++) {
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

});
BetaJS.$ = "jQuery" in window ? window.jQuery : null;

BetaJS.Browser = BetaJS.Browser || {};

BetaJS.Browser.Loader = {
	
	loadScript: function (url, callback, context) {
		var executed = false;
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.src = url;
		script.onload = script.onreadystatechange = function() {
			if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				executed = true;
				script.onload = script.onreadystatechange = null;
				if (callback)
					callback.call(context || this, url);
				// Does not work properly if we remove the script for some reason if it is used the second time !?
				//head.removeChild(script);
			}
		};
		head.appendChild(script);
	},
	
	loadStyles: function (url, callback, context) {
		var executed = false;
		var head = document.getElementsByTagName("head")[0];
		var style = document.createElement("link");
		style.rel = "stylesheet";
		style.href = url;
		style.onload = style.onreadystatechange = function() {
			if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				executed = true;
				style.onload = style.onreadystatechange = null;
				if (callback)
					callback.call(context || this, url);
			}
		};
		head.appendChild(style);
	},

	inlineStyles: function (styles) {
		BetaJS.$('<style>' + styles + "</style>").appendTo("head");
	},
	
	loadHtml: function (url, callback, context) {
		BetaJS.$.ajax({
			url: url,
			dataType: "html"
		}).done(function(content) {
			callback.call(context || this, content, url);
		});
	}

};
BetaJS.Browser = BetaJS.Browser || {}; 

/** @class */
BetaJS.Browser.Router = BetaJS.Class.extend("BetaJS.Browser.Router", [
	BetaJS.Events.EventsMixin,
	/** @lends BetaJS.Browser.Router.prototype */
	{
		
	/** Specifies all routes. Can either be an associative array, an array of associative arrays or a function returning one of those.
	 * 
	 * <p>A route is a mapping from a regular expression to a route descriptor. A route descriptor is either a name of a callback function or a route descriptor associative array.</p>
	 * <p>The callback function should accept the parameters given by the capturing groups of the regular expression</p>
	 * The route descriptor object may contain the following options:
	 * <ul>
	 *   <li>
	 *     action: the callback function; either a string or a function (mandatory)
	 *   </li>
	 *   <li>
	 *     path: name of the route; can be used to look up route (optional)
	 *   </li>
	 *   <li>
	 *     applicable: array of strings or functions or string or function to determine whether the route is applicable; if it is not, it will be skipped (optional)
	 *   </li>
	 *   <li>
	 *     valid: array of strings or functions or string or function to determine whether an applicable route is valid; if it is not, the routing fails (optional)
	 *   </li>
	 * </ul>
	 * @return routes
	 * @example
	 * return {
	 * 	"users/(\d+)/post/(\d+)" : "users_post",
	 *  "users/(\d+)/account": {
	 * 	  action: "users_account",
	 *    path: "users_account_path",
	 *    applicable: "is_user",
	 *    valid: "is_admin"
	 *  }
	 * }
	 */	
	routes: [],
	
	/** Creates a new router with options
	 * <ul>
	 *  <li>routes: adds user defined routes</li> 
	 *  <li>actions: extends the object by user-defined actions</li>
	 * </ul>
	 * @param options options
	 */
	constructor: function (options) {
		this._inherited(BetaJS.Browser.Router, "constructor");
		var routes = BetaJS.Types.is_function(this.routes) ? this.routes() : this.routes;
		if (!BetaJS.Types.is_array(routes))
			routes = [routes];
		if ("routes" in options) {
			if (BetaJS.Types.is_array(options["routes"]))
				routes = routes.concat(options["routes"]);
			else
				routes.push(options["routes"]);
		}
		this.__routes = [];
		this.__paths = {};
		this.__current = null;
		BetaJS.Objs.iter(routes, function (assoc) {
			BetaJS.Objs.iter(assoc, function (obj, key) {
				if (BetaJS.Types.is_string(obj))
					obj = {action: obj};
				obj.key = key;
				obj.route = new RegExp("^" + key + "$");
				if (!("applicable" in obj))
					obj.applicable = [];
				else if (!BetaJS.Types.is_array(obj.applicable))
					obj.applicable = [obj.applicable];
				if (!("valid" in obj))
					obj.valid = [];
				else if (!BetaJS.Types.is_array(obj.valid))
					obj.valid = [obj.valid];
				if (!("path" in obj))
					obj.path = obj.key;
				this.__routes.push(obj);
				this.__paths[obj.path] = obj;
			}, this);
		}, this);
		if ("actions" in options)
			BetaJS.Objs.iter(options.actions, function (action, key) {
				this[key] = action;
			}, this);
	},
	
	destroy: function() {
		this.__leave();
		this._inherited(BetaJS.Browser.Router, "destroy");
	},
	
	/** Parse a given route and map it to the first applicable object that is valid
	 * @param route the route given as a strings
	 * @return either null if nothing applicable and valid could be matched or an associative array with params and routing object as attributes.
	 */
	parse: function (route) {
		for (var i = 0; i < this.__routes.length; ++i) {
			var obj = this.__routes[i];
			var result = obj.route.exec(route);
			if (result !== null) {
				result.shift(1);
				var applicable = true;
				BetaJS.Objs.iter(obj.applicable, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					applicable = applicable && f.apply(this, result);
				}, this);
				if (!applicable)
					continue;
				var valid = true;
				BetaJS.Objs.iter(obj.valid, function (s) {
					var f = BetaJS.Types.is_string(s) ? this[s] : s;
					valid = valid && f.apply(this, result);
				}, this);
				if (!valid)
					return null;
				return {
					object: obj,
					params: result
				};
			}
		}
		return null;
	},
	
	/** Looks up the routing object given a path descriptor
 	 * @param path the path descriptor
 	 * @return the routing object
	 */
	object: function (path) {
		return this.__paths[path];
	},
	
	/** Returns the route of a path description
	 * @param path the path descriptor
	 * @param parameters parameters that should be attached to the route (capturing groups)
	 */
	path: function (path) {
		var key = this.object(path).key;
		var args = Array.prototype.slice.apply(arguments, [1]);
		var regex = /\(.*?\)/;
		while (true) {
			var arg = args.shift();
			if (!arg)
				break;
			key = key.replace(regex, arg);
		}
		return key;
	},
	
	/** Navigate to a given route, invoking the matching action.
 	 * @param route the route
	 */
	navigate: function (route) {
		this.trigger("navigate", route);
		var result = this.parse(route);
		if (result === null) {
			this.trigger("navigate-fail", route);
			return false;
		}
		this.trigger("navigate-success", result.object, result.params);
		return this.invoke(result.object, result.params, route);
	},
	
	/** Invoke a routing object with parameters
	 * <p>
	 *   Invokes the protected method _invoke
	 * </p>
	 * @param object the routing object
	 * @param params (optional) the parameters that should be attached to the route
	 * @param route (optional) an associated route that should be saved
	 */
	invoke: function (object, params, route) {
		route = route || this.path(object.key, params);
		this.trigger("before_invoke", object, params, route);
		this.__enter(object, params, route);
		this.trigger("after_invoke", object, params, route);
		var result = this._invoke(object, params);
		return result;
	},
	
	/** Invokes a routing object with parameters.
	 * <p>
	 *   Can be overwritten and does the invoking.
	 * </p>
	 * @param object the routing object
	 * @param params (optional) the parameters that should be attached to the route
	 */
	_invoke: function (object, params) {
		var f = object.action;
		if (BetaJS.Types.is_string(f))
			f = this[f];
		return f.apply(this, params);
	},
	
	__leave: function () {
		if (this.__current !== null) {
			this.trigger("leave", this.__current);
			this.__current.destroy();
			this.__current = null;
		}
	},
	
	__enter: function (object, params, route) {
		this.__leave();
		this.__current = new BetaJS.Events.Events();
		this.__current.route = route;
		this.__current.object = object;
		this.__current.params = params;
		this.trigger("enter", this.__current);
	},
	
	/** Returns the current route object.
	 * <ul>
	 *  <li>route: the route as string</li>
	 *  <li>object: the routing object</li>
	 *  <li>params: the params</li>
	 * </ul>
	 */
	current: function () {
		return this.__current;
	}
		
}]);


BetaJS.Class.extend("BetaJS.Browser.RouterHistory", [
	BetaJS.Events.EventsMixin,
	{
	
	constructor: function (router) {
		this._inherited(BetaJS.Browser.RouterHistory, "constructor");
		this.__router = router;
		this.__history = [];
		router.on("after_invoke", this.__after_invoke, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Browser.RouterHistory, "destroy");
	},
	
	__after_invoke: function (object, params) {
		this.__history.push({
			object: object,
			params: params
		});
		this.trigger("change");
	},
	
	last: function (index) {
		index = index || 0;
		return this.get(this.count() - 1 - index);
	},
	
	count: function () {
		return this.__history.length;
	},
	
	get: function (index) {
		index = index || 0;
		return this.__history[index];
	},
	
	getRoute: function (index) {
		var item = this.get(index);
		return this.__router.path(item.object.path, item.params);
	},
	
	back: function (index) {
		if (this.count() < 2)
			return null;
		index = index || 0;
		while (index >= 0 && this.count() > 1) {
			this.__history.pop();
			--index;
		}
		var item = this.__history.pop();
		this.trigger("change");
		return this.__router.invoke(item.object, item.params);
	}
	
}]);


BetaJS.Class.extend("BetaJS.Browser.RouteBinder", {

	constructor: function (router) {
		this._inherited(BetaJS.Browser.RouteBinder, "constructor");
		this.__router = router;
		this.__router.on("after_invoke", function (object, params, route) {
			if (this._getExternalRoute() != route)
				this._setExternalRoute(route);
		}, this);
	},
	
	destroy: function () {
		this.__router.off(null, null, this);
		this._inherited(BetaJS.Browser.RouteBinder, "destroy");
	},
	
	current: function () {
		return this._getExternalRoute();
	},
	
	_setRoute: function (route) {
		var current = this.__router.current();
		if (current && current.route == route)
			return;
		this.__router.navigate(route);
	},
	
	_getExternalRoute: function () { return ""; },
	_setExternalRoute: function (route) { }
	
});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.HashRouteBinder", {
	
	constructor: function (router) {
		this._inherited(BetaJS.Browser.HashRouteBinder, "constructor", router);
		var self = this;
		BetaJS.$(window).on("hashchange.events" + this.cid(), function () {
			self._setRoute(self._getExternalRoute());
		});
	},
	
	destroy: function () {
		BetaJS.$(window).off("hashchange.events" + this.cid());
		this._inherited(BetaJS.Browser.HashRouteBinder, "destroy");
	},
	
	_getExternalRoute: function () {
		var hash = window.location.hash;
		return (hash.length && hash[0] == '#') ? hash.slice(1) : hash;
	},
	
	_setExternalRoute: function (route) {
		window.location.hash = "#" + route;
	}

});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.HistoryRouteBinder", {
		
	constructor: function (router) {
		this._inherited(BetaJS.Browser.HistoryRouteBinder, "constructor", router);
		var self = this;
		this.__used = false;
		BetaJS.$(window).on("popstate.events" + this.cid(), function () {
			if (self.__used)
				self._setRoute(self._getExternalRoute());
		});
	},
	
	destroy: function () {
		BetaJS.$(window).off("popstate.events" + this.cid());
		this._inherited(BetaJS.Browser.HistoryRouteBinder, "destroy");
	},

	_getExternalRoute: function () {
		return window.location.pathname;
	},
	
	_setExternalRoute: function (route) {
		window.history.pushState({}, document.title, route);
		this.__used = true;
	}
}, {
	supported: function () {
		return window.history && window.history.pushState;
	}
});


BetaJS.Browser.RouteBinder.extend("BetaJS.Browser.LocationRouteBinder", {
	_getExternalRoute: function () {
		return window.location.pathname;
	},
	
	_setExternalRoute: function (route) {
		window.location.pathname = route;
	}
});