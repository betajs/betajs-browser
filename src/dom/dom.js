Scoped.define("module:Dom", [
    "base:Objs",
    "jquery:",
    "base:Types",
    "module:Info"
], function (Objs, $, Types, Info) {
	return {
		
		outerHTML: function (element) {
			if (!Info.isFirefox() || Info.firefoxVersion() >= 11)
				return element.outerHTML;
			return $('<div>').append($(element).clone()).html();
		},
		
		changeTag: function (node, name) {
			var replacement = document.createElement(name);
			for (var i = 0; i < node.attributes.length; ++i)
				replacement.setAttribute(node.attributes[i].nodeName, node.attributes[i].nodeValue);
		    while (node.firstChild)
		        replacement.appendChild(node.firstChild);
		    node.parentNode.replaceChild(replacement, node);
			return replacement;
		},		
		
		traverseNext: function (node, skip_children) {
			if ("get" in node)
				node = node.get(0);
			if (node.firstChild && !skip_children)
				return $(node.firstChild);
			if (!node.parentNode)
				return null;
			if (node.nextSibling)
				return $(node.nextSibling);
			return this.traverseNext(node.parentNode, true);
		},
		
		/** @suppress {checkTypes} */
		selectNode : function(node, offset) {
			node = $(node).get(0);
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
	
		/** @suppress {checkTypes} */
		selectionStartNode : function() {
			if (window.getSelection)
				return $(window.getSelection().getRangeAt(0).startContainer);
			else if (document.selection)
				return $(document.selection.createRange().startContainer);
			return null;
		},
		
		/** @suppress {checkTypes} */
		selectedHtml : function() {
			if (window.getSelection)
				return window.getSelection().toString();
			else if (document.selection)
				return document.selection.createRange().htmlText;
			return "";
		},
		
		/** @suppress {checkTypes} */
		selectionAncestor : function() {
			if (window.getSelection)
				return $(window.getSelection().getRangeAt(0).commonAncestorContainer);
			else if (document.selection)
				return $(document.selection.createRange().parentElement());
			return null;
		},
		
		/** @suppress {checkTypes} */
		selectionStartOffset: function () {
			if (window.getSelection)
				return window.getSelection().getRangeAt(0).startOffset;
			else if (document.selection)
				return document.selection.createRange().startOffset;
			return null;
		},
		
		/** @suppress {checkTypes} */
		selectionEndOffset: function () {
			if (window.getSelection)
				return window.getSelection().getRangeAt(0).endOffset;
			else if (document.selection)
				return document.selection.createRange().endOffset;
			return null;
		},
	
		/** @suppress {checkTypes} */
		selectionStart : function() {
			if (window.getSelection)
				return $(window.getSelection().getRangeAt(0).startContainer);
			else if (document.selection)
				return $(document.selection.createRange().startContainer);
			return null;
		},
	
		/** @suppress {checkTypes} */
		selectionEnd : function() {
			if (window.getSelection)
				return $(window.getSelection().getRangeAt(0).endContainer);
			else if (document.selection)
				return $(document.selection.createRange().endContainer);
			return null;
		},
		
		/** @suppress {checkTypes} */
		selectionNonEmpty: function () {
			var start = this.selectionStart();
			var end = this.selectionEnd();
			return start && end && start.get(0) && end.get(0) && (start.get(0) != end.get(0) || this.selectionStartOffset() != this.selectionEndOffset());
		},
		
		/** @suppress {checkTypes} */
		selectionContained: function (node) {
			return node.has(this.selectionStart()).length > 0 && node.has(this.selectionEnd()).length > 0;
		},
	
		/** @suppress {checkTypes} */
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
		
		/** @suppress {checkTypes} */
		selectionLeaves: function () {
			return Objs.filter(this.selectionNodes(), function (node) { return node.children().length === 0; });
		},
		
		contentSiblings: function (node) {
			return node.parent().contents().filter(function () {
				return this != node.get(0);
			});
		},
		
		remove_tag_from_parent_path: function (node, tag, context) {	
			tag = tag.toLowerCase();
			node = $(node);
			var parents = node.parents(context ? context + " " + tag : tag);
			for (var i = 0; i < parents.length; ++i) {
				var parent = parents.get(i);
				parent = $(parent);
				while (node.get(0) != parent.get(0)) {
					this.contentSiblings(node).wrap("<" + tag + "></" + tag + ">");
					node = node.parent();
				}
				parent.contents().unwrap();
			}
		},
		
		/** @suppress {checkTypes} */
		selectionSplitOffsets: function () {
			var startOffset = this.selectionStartOffset();
			var endOffset = this.selectionEndOffset();
			var start = this.selectionStart();
			var end = this.selectionEnd();
			var single = start.get(0) == end.get(0);
			if (endOffset < end.get(0).wholeText.length) {
				var endElem = end.get(0);
				endElem.splitText(endOffset);
				end = $(endElem);
				if (single)
					start = end;
			}
			if (startOffset > 0) {
				start = $(start.get(0).splitText(startOffset));
				if (single)
					end = start;
			}
			this.selectRange(start, end);
		},
		
		/** @suppress {checkTypes} */
		selectRange: function (start_node, end_node, start_offset, end_offset) {
			start_node = $(start_node);
			end_node = $(end_node);
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
			node = $(node);
			start_offset = start_offset || 0;
			end_offset = end_offset || node.get(0).data.length;
			if (end_offset < node.get(0).data.length) {
				var elem = node.get(0);
				elem.splitText(end_offset);
				node = $(elem);
			}
			if (start_offset > 0) 
				node = $(node.get(0).splitText(start_offset));
			return node;
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
		
		elementSupportsFullscreen: function (element) {
			return [
			    "requestFullscreen",
			    "webkitRequestFullscreen",
			    "mozRequestFullScreen",
			    "msRequestFullscreen"
			].some(function (key) {
				return key in element;
			});
		},
		
		elementEnterFullscreen: function (element) {
			Objs.iter([
			    "requestFullscreen",
			    "webkitRequestFullscreen",
			    "mozRequestFullScreen",
			    "msRequestFullscreen"
			], function (key) {
				if (key in element)
					element[key].call(element);
				return !(key in element);
			});
		},
		
		elementIsFullscreen: function (element) {
			return [
			    "fullscreenElement",
			    "webkitFullscreenElement",
			    "mozFullScreenElement",
			    "msFullscreenElement"
			].some(function (key) {
				return document[key] === element;
			});
		},
		
		elementOnFullscreenChange: function (element, callback, context) {
			var self = this;
			$(element).on([
			    "fullscreenchange",
			    "webkitfullscreenchange",
			    "mozfullscreenchange",
			    "MSFullscreenChange"
            ].join(" "), function () {
				callback.call(context || this, element, self.elementIsFullscreen(element));
			});
		},
		
		elementOffFullscreenChange: function (element) {
			$(element).off([
			    "fullscreenchange",
			    "webkitfullscreenchange",
			    "mozfullscreenchange",
			    "MSFullscreenChange"
            ].join(" "));
		}
		
				
	};
});