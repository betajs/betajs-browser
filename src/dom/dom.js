Scoped.define("module:Dom", [
    "jquery:",
    "base:Types",
    "module:Info"
], function ($, Types, Info) {
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

		
		/* Rest depends on jQuery */
		
		outerHTML: function (element) {
           if (!Info.isFirefox() || Info.firefoxVersion() >= 11)
               return element.outerHTML;
           return $('<div>').append($(element).clone()).html();
        },
			              
		unbox: function (element) {
			return $(element).get(0);
		},
		
		elementOffset: function (element) {
			return $(element).offset();
		},
		
		elementDimensions: function (element) {
			return {
				width: $(element).width(),
				height: $(element).height()
			};
		},
		
		triggerDomEvent: function (element, eventName) {
			$(element).trigger(eventName);
		},
		
		remove_tag_from_parent_path: function (node, tag, context) {	
			tag = tag.toLowerCase();
			node = $(node);
			var parents = node.parents(context ? context + " " + tag : tag);
			for (var i = 0; i < parents.length; ++i) {
				var parent = parents.get(i);
				parent = $(parent);
				while (node.get(0) != parent.get(0)) {
					this.contentSiblings(node.get(0)).wrap("<" + tag + "></" + tag + ">");
					node = node.parent();
				}
				parent.contents().unwrap();
			}
		},
		
		entitiesToUnicode: function (s) {
			if (!s || !Types.is_string(s) || s.indexOf("&") < 0)
				return s;
			var temp = document.createElement("span");
			temp.innerHTML = s;
			s = $(temp).text();
			if (temp.remove)
				temp.remove();
			return s;
		},
		
		contentSiblings: function (node) {
			return $(node.parentNode).contents().filter(function () {
				return this != node.get(0);
			});
		}
		
				
	};
});