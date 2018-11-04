Scoped.define("module:Dom", [
    "base:Types",
    "base:Objs",
    "module:Info",
    "base:Async"
], function(Types, Objs, Info, Async) {

    var TEMPLATE_TAG_MAP = {
        "tr": ["table", "tbody"],
        "td": ["table", "tbody", "tr"],
        "th": ["table", "thead", "tr"]
    };

    var INTERACTION_EVENTS = ["click", "mousedown", "mouseup", "touchstart", "touchend", "keydown", "keyup", "keypress"];

    var userInteractionCallbackList = [];
    var userInteractionCallbackWaiting = false;
    var userInteractionCallbackFunc = function() {
        userInteractionCallbackList.forEach(function(entry) {
            entry.callback.call(entry.context || this);
        });
        userInteractionCallbackList = [];
        userInteractionCallbackWaiting = false;
        INTERACTION_EVENTS.forEach(function(event) {
            window.removeEventListener(event, userInteractionCallbackFunc);
        });
    };

    return {

        ready: function(callback, context) {
            if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
                Async.eventually(callback, context);
            } else {
                var completed;
                var done = false;
                var timer = null;
                completed = function() {
                    clearInterval(timer);
                    document.removeEventListener("DOMContentLoaded", completed);
                    window.removeEventListener("load", completed);
                    if (done)
                        return;
                    done = true;
                    callback.apply(context || this);
                };
                document.addEventListener("DOMContentLoaded", completed);
                window.addEventListener("load", completed);
                timer = setInterval(function() {
                    if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll))
                        completed();
                }, 10);
            }
        },

        userInteraction: function(callback, context) {
            userInteractionCallbackList.push({
                callback: callback,
                context: context
            });
            if (!userInteractionCallbackWaiting) {
                userInteractionCallbackWaiting = true;
                INTERACTION_EVENTS.forEach(function(event) {
                    window.addEventListener(event, userInteractionCallbackFunc);
                });
            }
        },

        isTabHidden: function() {
            return document.hidden || document.webkitHidden || document.mozHidden || document.msHidden;
        },

        elementsByTemplate: function(template) {
            template = template.trim();
            var polyfill = Info.isInternetExplorer() && Info.internetExplorerVersion() < 9;
            /*
             * TODO: This is probably not a good fix.
             * 
             * Some tags, like tr, are not generated by the browser when under a generic tag like div.
             * In other words
             * 
             * <div>.innerHTML = "<tr><p>foo</p></tr>" will become <div><p>foo</p></div>
             * 
             * The quick fix here checks for an outer tag and picks the proper temporary parent tag.
             * 
             * This needs to be fixed properly in the future.
             */
            var parentTags = [];
            Objs.iter(TEMPLATE_TAG_MAP, function(value, key) {
                if (template.indexOf("<" + key) === 0) {
                    parentTags = value;
                    polyfill = false;
                }
            });
            var outerTemplate = [
                parentTags.map(function(t) {
                    return "<" + t + ">";
                }).join(""),
                polyfill ? "<br/>" : "",
                template,
                parentTags.map(function(t) {
                    return "</" + t + ">";
                }).join("")
            ].join("");
            var element = document.createElement("div");
            element.innerHTML = outerTemplate;
            parentTags.forEach(function() {
                element = element.children[0];
            });
            var result = [];
            for (var i = polyfill ? 1 : 0; i < element.children.length; ++i)
                result.push(element.children[i]);
            return result;
        },

        elementByTemplate: function(template) {
            var result = this.elementsByTemplate(template);
            return result.length > 0 ? result[0] : null;
        },

        changeTag: function(node, name) {
            var replacement = document.createElement(name);
            for (var i = 0; i < node.attributes.length; ++i) {
                var attr = node.attributes[i];
                replacement.setAttribute(attr.nodeName, "value" in attr ? attr.value : attr.nodeValue);
            }
            while (node.firstChild)
                replacement.appendChild(node.firstChild);
            if (node.parentNode)
                node.parentNode.replaceChild(replacement, node);
            return replacement;
        },

        traverseNext: function(node, skip_children) {
            node = this.unbox(node);
            if (node.firstChild && !skip_children)
                return node.firstChild;
            if (!node.parentNode)
                return null;
            if (node.nextSibling)
                return node.nextSibling;
            return this.traverseNext(node.parentNode, true);
        },

        splitNode: function(node, start_offset, end_offset) {
            start_offset = start_offset || 0;
            end_offset = end_offset || (node.wholeText ? node.wholeText.length : 0);
            if (end_offset < (node.wholeText ? node.wholeText.length : 0))
                node.splitText(end_offset);
            if (start_offset > 0)
                node = node.splitText(start_offset);
            return node;
        },

        __FULLSCREEN_EVENTS: ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"],
        __FULLSCREEN_METHODS: ["requestFullscreen", "webkitRequestFullscreen", "mozRequestFullScreen", "msRequestFullscreen", "webkitEnterFullScreen"],
        __FULLSCREEN_ATTRS: ["fullscreenElement", "webkitFullscreenElement", "mozFullScreenElement", "msFullscreenElement"],
        __FULLSCREEN_EXIT_METHODS: ["exitFullscreen", "mozCancelFullScreen", "webkitExitFullscreen"],

        elementSupportsFullscreen: function(element) {
            return element && this.__FULLSCREEN_METHODS.some(function(key) {
                return key in element;
            });
        },

        elementEnterFullscreen: function(element) {
            var done = false;
            this.__FULLSCREEN_METHODS.forEach(function(key) {
                if (!done && (key in element)) {
                    element[key].call(element);
                    done = true;
                }
            });
        },

        // Will exit from document's full screen mode
        documentExitFullscreen: function() {
            this.__FULLSCREEN_EXIT_METHODS.forEach(function(key) {
                if (document[key]) {
                    document[key]();
                }
            });
        },

        elementIsFullscreen: function(element) {
            return this.__FULLSCREEN_ATTRS.some(function(key) {
                return document[key] === element;
            });
        },

        elementOnFullscreenChange: function(element, callback, context) {
            var self = this;
            var listener = function() {
                callback.call(context || this, element, self.elementIsFullscreen(element));
            };
            this.__FULLSCREEN_EVENTS.forEach(function(event) {
                element.addEventListener(event, listener, false);
            });
            return listener;
        },

        elementOffFullscreenChange: function(element, listener) {
            this.__FULLSCREEN_EVENTS.forEach(function(event) {
                element.removeEventListener(event, listener, false);
            });
        },

        entitiesToUnicode: function(s) {
            if (!s || !Types.is_string(s) || s.indexOf("&") < 0)
                return s;
            return s.split(">").map(function(s) {
                return s.split("<").map(function(s) {
                    var temp = document.createElement("span");
                    temp.innerHTML = s;
                    s = temp.textContent || temp.innerText;
                    if (temp.remove)
                        temp.remove();
                    return s;
                }).join("<");
            }).join(">");
        },

        unbox: function(element) {
            if (Types.is_string(element))
                element = document.querySelector(element);
            return !element || element.nodeType ? element : element.get(0);
        },

        triggerDomEvent: function(element, eventName, parameters, customEventParams) {
            element = this.unbox(element);
            eventName = eventName.toLowerCase();
            var onEvent = "on" + eventName;
            var onEventHandler = null;
            var onEventCalled = false;
            if (element[onEvent]) {
                onEventHandler = element[onEvent];
                element[onEvent] = function() {
                    if (onEventCalled)
                        return;
                    onEventCalled = true;
                    onEventHandler.apply(this, arguments);
                };
            }
            try {
                var event;
                try {
                    if (customEventParams)
                        event = new CustomEvent(eventName, customEventParams);
                    else
                        event = new Event(eventName);
                } catch (e) {
                    try {
                        if (customEventParams) {
                            event = document.createEvent('CustomEvent');
                            event.initCustomEvent(eventName, customEventParams.bubbles || false, customEventParams.cancelable || false, customEventParams.detail || false);
                        } else {
                            event = document.createEvent('Event');
                            event.initEvent(eventName, false, false);
                        }
                    } catch (e) {
                        event = document.createEventObject();
                        event.type = eventName;
                    }
                }
                Objs.extend(event, parameters);
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

        elementOffset: function(element) {
            element = this.unbox(element);
            var top = 0;
            var left = 0;
            if (element.getBoundingClientRect) {
                var box = element.getBoundingClientRect();
                top = box.top;
                left = box.left - (document.body.getBoundingClientRect ? document.body.getBoundingClientRect().left : 0);
            }
            docElem = document.documentElement;
            return {
                top: top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
                left: left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
            };
        },

        elementDimensions: function(element) {
            element = this.unbox(element);
            var cs, w, h;
            if (element && window.getComputedStyle) {
                try {
                    cs = window.getComputedStyle(element);
                } catch (e) {}
                if (cs) {
                    w = parseInt(cs.width, 10);
                    h = parseInt(cs.height, 10);
                    if (w && h) {
                        return {
                            width: w,
                            height: h
                        };
                    }
                }
            }
            if (element && element.currentStyle) {
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
            if (element && element.getBoundingClientRect) {
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
        },

        childContainingElement: function(parent, element) {
            parent = this.unbox(parent);
            element = this.unbox(element);
            while (element.parentNode != parent) {
                if (element == document.body)
                    return null;
                element = element.parentNode;
            }
            return element;
        },

        elementBoundingBox: function(element) {
            var offset = this.elementOffset(element);
            var dimensions = this.elementDimensions(element);
            return {
                left: offset.left,
                top: offset.top,
                right: offset.left + dimensions.width - 1,
                bottom: offset.top + dimensions.height - 1
            };
        },

        pointWithinElement: function(x, y, element) {
            var bb = this.elementBoundingBox(element);
            return bb.left <= x && x <= bb.right && bb.top <= y && y <= bb.bottom;
        },

        elementFromPoint: function(x, y, disregarding, parent) {
            disregarding = disregarding || [];
            if (!Types.is_array(disregarding))
                disregarding = [disregarding];
            var backup = [];
            for (var i = 0; i < disregarding.length; ++i) {
                disregarding[i] = this.unbox(disregarding[i]);
                backup.push(disregarding[i].style.zIndex);
                disregarding[i].style.zIndex = -1;
            }
            var element = document.elementFromPoint(x - window.pageXOffset, y - window.pageYOffset);
            for (i = 0; i < disregarding.length; ++i)
                disregarding[i].style.zIndex = backup[i];
            while (element && parent && element.parentNode !== parent)
                element = element.parentNode;
            return element;
        },

        elementAddClass: function(element, cls) {
            if (!element.className)
                element.className = cls;
            else if (!this.elementHasClass(element, cls))
                element.className = element.className + " " + cls;
        },

        elementHasClass: function(element, cls) {
            return element.className.split(" ").some(function(name) {
                return name === cls;
            });
        },

        elementRemoveClass: function(element, cls) {
            element.className = element.className.split(" ").filter(function(name) {
                return name !== cls;
            }).join(" ");
        },

        elementInsertBefore: function(element, before) {
            before.parentNode.insertBefore(element, before);
        },

        elementInsertAfter: function(element, after) {
            if (after.nextSibling)
                after.parentNode.insertBefore(element, after.nextSibling);
            else
                after.parentNode.appendChild(element);
        },

        elementInsertAt: function(element, parent, index) {
            if (index >= parent.children.length)
                parent.appendChild(element);
            else
                parent.insertBefore(element, parent.children[Math.max(0, index)]);
        },

        elementIndex: function(element) {
            var idx = 0;
            while (element.previousElementSibling) {
                idx++;
                element = element.previousElementSibling;
            }
            return idx;
        },

        elementPrependChild: function(parent, child) {
            if (parent.children.length > 0)
                parent.insertBefore(child, parent.firstChild);
            else
                parent.appendChild(child);
        },

        // Will find closest parent element, will stop on stopSelector
        // example:  Dom.elementReplaceClasses(element, '.look-element-class-name', '.stop-on-class-name')
        elementFindClosestParent: function(element, selector, stopSelector) {
            var _returnVal = null;
            while (element) {
                if (element.className.indexOf(selector) > -1) {
                    _returnVal = element;
                    break;
                } else if (stopSelector && element.className.indexOf(stopSelector) > -1) {
                    break;
                }
                element = element.parentElement;
            }
            return _returnVal;
        },

        // Will replace class names on element
        elementReplaceClasses: function(element, replaceClass, replaceWith) {
            if (this.elementHasClass(element, replaceClass)) {
                this.elementRemoveClass(element, replaceClass);
                this.elementAddClass(element, replaceWith);
            }
        },

        // When element in visible port view, will return true
        isElementVisible: function(element, fraction) {
            fraction = fraction || 0.8;

            var offset = this.elementOffset(element);
            var x = offset.left;
            var y = offset.top;
            var w = element.offsetWidth;
            var h = element.offsetHeight;
            var right = x + w;
            var bottom = y + h;

            var visibleX = Math.max(0, Math.min(w, window.pageXOffset + window.innerWidth - x, right - window.pageXOffset));
            var visibleY = Math.max(0, Math.min(h, window.pageYOffset + window.innerHeight - y, bottom - window.pageYOffset));

            var visible = visibleX * visibleY / (w * h);

            return (visible > fraction);
        },

        keyboardUnfocus: function() {
            if (document.activeElement)
                document.activeElement.blur();
        },

        passiveEventsSupported: function() {
            return Info.isiOS();
        },

        containerStickyBottom: function(someElement) {
            var lastScrollHeight = someElement.scrollHeight;
            var critical = false;
            var observer = new MutationObserver(function() {
                if (critical)
                    return;
                critical = true;
                var newScrollHeight = someElement.scrollHeight;
                var oldScrollHeight = lastScrollHeight;
                lastScrollHeight = newScrollHeight;
                if (newScrollHeight > oldScrollHeight)
                    someElement.scrollTop = someElement.scrollTop + newScrollHeight - oldScrollHeight;
                critical = false;
            });
            observer.observe(someElement, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
            return observer;
        }

    };
});