Scoped.define("module:DomMutation.NodeRemoveObserver", [
    "base:Classes.ConditionalInstance",
    "base:Events.EventsMixin"
], function(ConditionalInstance, EventsMixin, scoped) {
    return ConditionalInstance.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this);
                this._node = node;
            },

            _nodeRemoved: function(node) {
                if (node !== this._node)
                    return;
                this.trigger("node-removed");
            }

        };
    }]);
});



Scoped.define("module:DomMutation.MutationObserverNodeRemoveObserver", [
    "module:DomMutation.NodeRemoveObserver",
    "base:Objs"
], function(Observer, Objs, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this, node);
                var self = this;
                this._observer = new window.MutationObserver(function(mutations) {
                    Objs.iter(mutations, function(mutation) {
                        for (var i = 0; i < mutation.removedNodes.length; ++i)
                            self._nodeRemoved(mutation.removedNodes[i]);
                    });
                });
                this._observer.observe(node.parentNode, {
                    childList: true
                });
            },

            destroy: function() {
                this._observer.disconnect();
                inherited.destroy.call(this);
            }

        };
    }, {

        supported: function(node) {
            try {
                return !!window.MutationObserver;
            } catch (e) {
                return false;
            }
        }

    });
});



Scoped.define("module:DomMutation.DOMNodeRemovedNodeRemoveObserver", [
    "module:DomMutation.NodeRemoveObserver",
    "module:Info",
    "module:Events"
], function(Observer, Info, Events, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this, node);
                var events = this.auto_destroy(new Events());
                events.on(document, "DOMNodeRemoved", function(event) {
                    this._nodeRemoved(event.target);
                }, this);
            }

        };
    }, {

        supported: function(node) {
            return !Info.isInternetExplorer() || Info.internetExplorerVersion() >= 9;
        }

    });

});



Scoped.define("module:DomMutation.TimerNodeRemoveObserver", [
    "module:DomMutation.NodeRemoveObserver",
    "base:Timers.Timer"
], function(Observer, Timer, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this, node);
                this._timer = new Timer({
                    context: this,
                    fire: this._fire,
                    delay: 100
                });
            },

            destroy: function() {
                this._timer.weakDestroy();
                inherited.destroy.call(this);
            },

            _fire: function() {
                if (!this._node.parentElement) {
                    this._timer.stop();
                    this._nodeRemoved(this._node);
                }
            }

        };
    }, {

        supported: function(node) {
            return true;
        }

    });

});

Scoped.extend("module:DomMutation.NodeRemoveObserver", [
    "module:DomMutation.NodeRemoveObserver",
    "module:DomMutation.MutationObserverNodeRemoveObserver",
    "module:DomMutation.DOMNodeRemovedNodeRemoveObserver",
    "module:DomMutation.TimerNodeRemoveObserver"
], function(Observer, MutationObserverNodeRemoveObserver, DOMNodeRemovedNodeRemoveObserver, TimerNodeRemoveObserver) {
    Observer.register(MutationObserverNodeRemoveObserver, 3);
    Observer.register(DOMNodeRemovedNodeRemoveObserver, 2);
    Observer.register(TimerNodeRemoveObserver, 1);
    return {};
});


Scoped.define("module:DomMutation.NodeResizeObserver", [
    "base:Class",
    "base:Events.EventsMixin",
    "module:Events"
], function(Class, EventsMixin, Events, scoped) {
    return Class.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        return {

            constructor: function(node) {
                inherited.constructor.call(this);
                var events = this.auto_destroy(new Events());
                events.on(window, "resize", function(event) {
                    this._resized();
                }, this);
            },

            _resized: function() {
                this.trigger("node-resized");
            }

        };
    }]);
});


Scoped.define("module:DomMutation.NodeInsertObserver", [
    "base:Classes.ConditionalInstance",
    "base:Events.EventsMixin"
], function(ConditionalInstance, EventsMixin, scoped) {
    return ConditionalInstance.extend({
        scoped: scoped
    }, [EventsMixin, function(inherited) {
        return {

            _nodeInserted: function(node, expand) {
                if (expand) {
                    for (var i = 0; i < node.childNodes.length; ++i)
                        this._nodeInserted(node.childNodes[i], expand);
                }
                if (this._options.parent && node.parentNode !== this._options.parent)
                    return;
                if (this._options.root && !this._options.root.contains(node))
                    return;
                if (this._options.filter && !this._options.filter.call(this._options.context || this, node))
                    return;
                this.trigger("node-inserted", node);
            }

        };
    }]);
});


Scoped.define("module:DomMutation.MutationObserverNodeInsertObserver", [
    "module:DomMutation.NodeInsertObserver",
    "base:Objs"
], function(Observer, Objs, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                options = options || {};
                inherited.constructor.call(this, options);
                var self = this;
                this._observer = new window.MutationObserver(function(mutations) {
                    Objs.iter(mutations, function(mutation) {
                        for (var i = 0; i < mutation.addedNodes.length; ++i)
                            self._nodeInserted(mutation.addedNodes[i], true);
                    });
                });
                this._observer.observe(this._options.root || this._options.parent || document.body, {
                    childList: true,
                    subtree: !this._options.parent
                });
            },

            destroy: function() {
                this._observer.disconnect();
                inherited.destroy.call(this);
            }

        };
    }, {

        supported: function(node) {
            try {
                return !!window.MutationObserver;
            } catch (e) {
                return false;
            }
        }

    });
});



Scoped.define("module:DomMutation.DOMNodeInsertedNodeInsertObserver", [
    "module:DomMutation.NodeInsertObserver",
    "module:Events"
], function(Observer, Events, scoped) {
    return Observer.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(options) {
                options = options || {};
                inherited.constructor.call(this, options);
                var events = this.auto_destroy(new Events());
                events.on(document, "DOMNodeInserted", function(event) {
                    this._nodeInserted(event.target, true);
                }, this);
            }

        };
    }, {

        supported: function(node) {
            return true;
        }

    });
});


Scoped.extend("module:DomMutation.NodeInsertObserver", [
    "module:DomMutation.NodeInsertObserver",
    "module:DomMutation.MutationObserverNodeInsertObserver",
    "module:DomMutation.DOMNodeInsertedNodeInsertObserver"
], function(Observer, MutationObserverNodeInsertObserver, DOMNodeInsertedNodeInsertObserver) {
    Observer.register(MutationObserverNodeInsertObserver, 3);
    Observer.register(DOMNodeInsertedNodeInsertObserver, 2);
    return {};
});