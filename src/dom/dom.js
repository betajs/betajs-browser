Scoped.define("module:Dom", [
    "base:Types",
    "module:Info"
], function (Types, Info) {
	return {
		
		changeTag: function (node, name) {
			var replacement = document.createElement(name);
			for (var i = 0; i < node.attributes.length; ++i) {
				var attr = node.attributes[i];
				replacement.setAttribute(attr.nodeName, "value" in attr ? attr.value : attr.nodeValue);
			}
		    while (node.firstChild)
		        replacement.appendChild(node.firstChild);
		    node.parentNode.replaceChild(replacement, node);
			return replacement;
		},		
		
		traverseNext: function (node, skip_children) {
			node = this.unbox(node);
			if (node.firstChild && !skip_children)
				return node.firstChild;
			if (!node.parentNode)
				return null;
			if (node.nextSibling)
				return node.nextSibling;
			return this.traverseNext(node.parentNode, true);
		},
				
		splitNode: function (node, start_offset, end_offset) {
			start_offset = start_offset || 0;
			end_offset = end_offset || (node.wholeText ? node.wholeText.length : 0);
			if (end_offset < (node.wholeText ? node.wholeText.length : 0))
				node.splitText(end_offset);
			if (start_offset > 0) 
				node = node.splitText(start_offset);
			return node;
		},
		
		__FULLSCREEN_EVENTS: ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"],
		__FULLSCREEN_METHODS: ["requestFullscreen", "webkitRequestFullscreen", "mozRequestFullScreen", "msRequestFullscreen"],
		__FULLSCREEN_ATTRS: ["fullscreenElement", "webkitFullscreenElement", "mozFullScreenElement", "msFullscreenElement"],
		
		elementSupportsFullscreen: function (element) {
			return this.__FULLSCREEN_METHODS.some(function (key) {
				return key in element;
			});
		},
		
		elementEnterFullscreen: function (element) {
			var done = false;
			this.__FULLSCREEN_METHODS.forEach(function (key) {
				if (!done && (key in element)) {
					element[key].call(element);
					done = true;
				}
			});
		},
		
		elementIsFullscreen: function (element) {
			return this.__FULLSCREEN_ATTRS.some(function (key) {
				return document[key] === element;
			});
		},
		
		elementOnFullscreenChange: function (element, callback, context) {
			var self = this;
			var listener = function () {
				callback.call(context || this, element, self.elementIsFullscreen(element));
			};
			this.__FULLSCREEN_EVENTS.forEach(function (event) {
				element.addEventListener(event, listener, false);
			});
			return listener;
		},
		
		elementOffFullscreenChange: function (element, listener) {
			this.__FULLSCREEN_EVENTS.forEach(function (event) {
				element.removeEventListener(event, listener, false);
			});
		},

		entitiesToUnicode: function (s) {
			if (!s || !Types.is_string(s) || s.indexOf("&") < 0)
				return s;
			var temp = document.createElement("span");
			temp.innerHTML = s;
			s = temp.textContent || temp.innerText;
			if (temp.remove)
				temp.remove();
			return s;
		},
		
		unbox: function (element) {
			return !element || element.nodeType ? element : element.get(0);
		},
		
		triggerDomEvent: function (element, eventName) {
			element = this.unbox(element);
			eventName = eventName.toLowerCase();
			var onEvent = "on" + eventName;
			var onEventHandler = null;
			var onEventCalled = false;
			if (element[onEvent]) {
				onEventHandler = element[onEvent];
				element[onEvent] = function () {
					if (onEventCalled)
						return;
					onEventCalled = true;
					onEventHandler.apply(this, arguments);
				};
			}
			try {
				var event;
				try {
					event = new Event(eventName);
				} catch (e) {
					try {
						event = document.createEvent('Event');
						event.initEvent(eventName, false, false);
					} catch (e) {
						event = document.createEventObject();
						event.type = eventName;
					}
				}
				element.dispatchEvent(event);
				if (onEventHandler) {
					if (!onEventCalled)
						onEventHandler.call(element, event);
					element[onEvent] = onEventHandler;
				}
			} catch (e) {
				if (onEventHandler)
					element[onEvent] = onEventHandler;
				throw e;
			}
		},
		
		elementOffset: function (element) {
			element = this.unbox(element);
			var top = 0;
			var left = 0;
			if (element.getBoundingClientRect) {
				var box = element.getBoundingClientRect();
				top = box.top;
				left = box.left;
			}
			docElem = document.documentElement;
			return {
				top: top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
				left: left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
			};
		},
		
		elementDimensions: function (element) {
			element = this.unbox(element);
			var cs, w, h;
			if (window.getComputedStyle) {
				cs = window.getComputedStyle(element);
				w = parseInt(cs.width, 10);
				h = parseInt(cs.height, 10);
				if (w && h) {
					return {
						width: w,
						height: h
					};
				}
			}
			if (element.currentStyle) {
				cs = element.currentStyle;
				w = element.clientWidth - parseInt(cs.paddingLeft || 0, 10) - parseInt(cs.paddingRight || 0, 10);
				h = element.clientHeight - parseInt(cs.paddingTop || 0, 10) - parseInt(cs.paddingTop || 0, 10);
				if (w && h) {
					return {
						width: w,
						height: h
					};
				}
			}
			if (element.getBoundingClientRect) {
				var box = element.getBoundingClientRect();
				h = box.bottom - box.top;
				w = box.right - box.left;
				return {
					width: w,
					height: h
				};
			}
			return {
				width: 0,
				height: 0
			};
		}
		
	};
});