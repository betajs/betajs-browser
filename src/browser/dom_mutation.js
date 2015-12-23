Scoped.define("module:DomMutation.NodeRemoveObserver", [
    "base:Classes.ConditionalInstance",
    "base:Events.EventsMixin"
], function (ConditionalInstance, EventsMixin, scoped) {
	return ConditionalInstance.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
			
			constructor: function (node) {
				inherited.constructor.call(this);
				this._node = node;
			},
			
			_nodeRemoved: function (node) {
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
], function (Observer, Objs, scoped) {
	return Observer.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (node) {
				inherited.constructor.call(this, node);
				var self = this;
				this._observer = new MutationObserver(function (mutations) {
					Objs.iter(mutations, function (mutation) {
						for (var i = 0; i < mutation.removedNodes.length; ++i)
							self._nodeRemoved(mutation.removedNodes[i]);
					});
				});
				this._observer.observe(node.parentNode, {childList: true});
			},
			
			destroy: function () {
				this._observer.disconnect();
				inherited.destroy.call(this);
			}
			
		};
	}, {
		
		supported: function (node) {
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
	"jquery:"
], function (Observer, $, scoped) {
	return Observer.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (node) {
				inherited.constructor.call(this, node);
				var self = this;
				$(document).on("DOMNodeRemoved." + this.cid(), function (event) {
					self._nodeRemoved(event.target);
				});
			},
			
			destroy: function () {
				$(document).off("DOMNodeRemoved." + this.cid());
				inherited.destroy.call(this);
			}
			
		};
	}, {
		
		supported: function (node) {
			return true;
		}
		
	});	

});


Scoped.extend("module:DomMutation.NodeRemoveObserver", [
    "module:DomMutation.NodeRemoveObserver",
    "module:DomMutation.MutationObserverNodeRemoveObserver",
    "module:DomMutation.DOMNodeRemovedNodeRemoveObserver"
], function (Observer, MutationObserverNodeRemoveObserver, DOMNodeRemovedNodeRemoveObserver) {
	Observer.register(MutationObserverNodeRemoveObserver, 2);
	Observer.register(DOMNodeRemovedNodeRemoveObserver, 1);
	return {};
});


Scoped.define("module:DomMutation.NodeResizeObserver", [
    "base:Class",
    "base:Events.EventsMixin",
    "jquery:"
], function (Class, EventsMixin, $, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
			
			constructor: function (node) {
				inherited.constructor.call(this);
				var self = this;
				$(window).on("resize." + this.cid(), function () {
					self._resized();
				});
			},
			
			destroy: function () {
				$(window).off("." + this.cid());
				inherited.destroy.call(this);
			},
			
			_resized: function () {
				this.trigger("node-resized");
			}
			
		};
	}]);
});


Scoped.define("module:DomMutation.NodeInsertObserver", [
	"base:Classes.ConditionalInstance",
	"base:Events.EventsMixin"
], function (ConditionalInstance, EventsMixin, scoped) {
	return ConditionalInstance.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
			
			_nodeInserted: function (node) {
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
], function (Observer, Objs, scoped) {
	return Observer.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				var self = this;
				this._observer = new MutationObserver(function (mutations) {
					Objs.iter(mutations, function (mutation) {
						for (var i = 0; i < mutation.addedNodes.length; ++i)
							self._nodeInserted(mutation.addedNodes[i]);
					});
				});
				this._observer.observe(this._options.root || this._options.parent || document.body, {
					childList: true,
					subtree: !!this._options.parent
				});
			},
			
			destroy: function () {
				this._observer.disconnect();
				inherited.destroy.call(this);
			}
			
		};
	}, {
		
		supported: function (node) {
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
	"jquery:"
], function (Observer, $, scoped) {
	return Observer.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				var self = this;
				$(document).on("DOMNodeInserted." + this.cid(), function (event) {
					self._nodeInserted(event.target);
				});
			},
			
			destroy: function () {
				$(document).off("DOMNodeInserted." + this.cid());
				inherited.destroy.call(this);
			}
			
		};
	}, {
		
		supported: function (node) {
			return true;
		}
		
	});	
});


Scoped.extend("module:DomMutation.NodeInsertObserver", [
	"module:DomMutation.NodeInsertObserver",
	"module:DomMutation.MutationObserverNodeInsertObserver",
	"module:DomMutation.DOMNodeInsertedNodeInsertObserver"
], function (Observer, MutationObserverNodeInsertObserver, DOMNodeInsertedNodeInsertObserver) {
	Observer.register(MutationObserverNodeInsertObserver, 2);
	Observer.register(DOMNodeInsertedNodeInsertObserver, 1);
	return {};
});
