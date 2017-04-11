Scoped.define("module:Selection", [
    "module:Dom"
], function(Dom) {
    return {

        /** @suppress {checkTypes} */
        selectNode: function(node, offset) {
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
        selectedHtml: function() {
            if (window.getSelection)
                return window.getSelection().toString();
            else if (document.selection)
                return document.selection.createRange().htmlText;
            return "";
        },

        /** @suppress {checkTypes} */
        selectionStartOffset: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).startOffset;
            else if (document.selection)
                return document.selection.createRange().startOffset;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionEndOffset: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).endOffset;
            else if (document.selection)
                return document.selection.createRange().endOffset;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionNonEmpty: function() {
            var start = this.selectionStart();
            var end = this.selectionEnd();
            return start && end && start && end && (start != end || this.selectionStartOffset() != this.selectionEndOffset());
        },

        /** @suppress {checkTypes} */
        selectionContained: function(node) {
            return node.contains(this.selectionStart()) && node.contains(this.selectionEnd());
        },

        /** @suppress {checkTypes} */
        selectionNodes: function() {
            var result = [];
            var start = this.selectionStart();
            var end = this.selectionEnd();
            result.push(start);
            var current = start;
            while (current != end) {
                current = Dom.traverseNext(current);
                result.push(current);
            }
            return result;
        },

        /** @suppress {checkTypes} */
        selectionLeaves: function() {
            return this.selectionNodes().filter(function(node) {
                return !node.hasChildNodes();
            });
        },

        /** @suppress {checkTypes} */
        selectionStartNode: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).startContainer;
            else if (document.selection)
                return document.selection.createRange().startContainer;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionAncestor: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).commonAncestorContainer;
            else if (document.selection)
                return document.selection.createRange().parentElement();
            return null;
        },

        /** @suppress {checkTypes} */
        selectionStart: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).startContainer;
            else if (document.selection)
                return document.selection.createRange().startContainer;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionEnd: function() {
            if (window.getSelection)
                return window.getSelection().getRangeAt(0).endContainer;
            else if (document.selection)
                return document.selection.createRange().endContainer;
            return null;
        },

        /** @suppress {checkTypes} */
        selectionSplitOffsets: function() {
            var startOffset = this.selectionStartOffset();
            var endOffset = this.selectionEndOffset();
            var start = this.selectionStart();
            var end = this.selectionEnd();
            var single = start == end;
            if (endOffset < end.wholeText.length) {
                end.splitText(endOffset);
                if (single)
                    start = end;
            }
            if (startOffset > 0) {
                start = start.splitText(startOffset);
                if (single)
                    end = start;
            }
            this.selectRange(start, end);
        },

        /** @suppress {checkTypes} */
        selectRange: function(start_node, end_node, start_offset, end_offset) {
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
            range.setStart(start_node, start_offset || 0);
            range.setEnd(end_node, end_offset || end_node.data.length);
            selection.addRange(range);
        }

    };
});