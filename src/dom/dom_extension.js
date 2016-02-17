Scoped.define("module:DomExtend.DomExtension", [
    "base:Class",
    "jquery:",
    "base:Objs",
    "base:Functions",
    "base:Async",
    "module:DomMutation.NodeRemoveObserver",
    "module:DomMutation.NodeResizeObserver",
    "jquery:"
], function (Class, jquery, Objs, Functions, Async, NodeRemoveObserver, NodeResizeObserver, $, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			_domMethods: [],
			_domAttrs: {},
			
			constructor: function (element, attrs) {
				inherited.constructor.call(this);
				this._element = element;
				this._$element = $(element);
				element.domExtension = this;
				this._actualBB = null;
				this._idealBB = null;
				this._attrs = attrs || {};
				Objs.iter(this._domMethods, function (method) {
					this._element[method] = Functions.as_method(this[method], this);
				}, this);
				Objs.iter(['get', 'set'], function (method) {
					this._element[method] = Functions.as_method(this[method], this);
				}, this);
				Async.eventually(function () {
					this._nodeRemoveObserver = this.auto_destroy(new NodeRemoveObserver(element));
					this._nodeRemoveObserver.on("node-removed", this.weakDestroy, this);
					this._nodeResizeObserver = this.auto_destroy(new NodeResizeObserver(element));
					this._nodeResizeObserver.on("node-resized", function () {
						this.recomputeBB();
						this._notify("resized");
					}, this);
				}, this);
				if (!this._$element.css("display") || this._$element.css("display") == "inline")
					this._$element.css("display", "inline-block");
			},
			
			domEvent: function (eventName) {
				this._$element.trigger(eventName);
			},
			
			readAttr: function (key) {
				return key in this._element.attributes ? this._element.attributes[key].value : (key in this._element ? this._element[key] : this._attrs[key]);
			},
			
			hasAttr: function (key) {
				return key in this._element.attributes || key in this._element || key in this._attrs;
			},

			writeAttr: function (key, value) {
				if (key in this._element.attributes)
					this._element.attributes[key].value = value;
				else if (key in this._element)
					this._element[key] = value;
				else
					this._attrs[key] = value;
			},
			
			unsetAttr: function (key) {
				delete this._element[key];
				this._element.removeAttribute(key);
				delete this._attrs[key];
			},
			
			get: function (key) {
				var meta = this._domAttrs[key] || {};
				if (!(meta.get))
					return this.readAttr(key);
				var value = Functions.callWithin(this, meta.get);
				this.writeAttr(key, value);
				return value;
			},
			
			set: function (key, value) {
				this.writeAttr(key, value);
				var meta = this._domAttrs[key] || {};
				if (meta.set)
					Functions.callWithin(this, meta.set, value);
			},
			
			computeActualBB: function (idealBB) {
				var width = this._$element.width();
				if (this._$element.width() <= idealBB.width && !this._element.style.width) {
					this._element.style.width = idealBB.width + "px";
					width = this._$element.width();
					var current = this._$element;
					while (current.get(0) != document) {
						current = current.parent();
						width = Math.min(width, current.width());
					}
					this._element.style.width = null;
				}
				return {
					width: width,
					height: Math.round(width * idealBB.height / idealBB.width)
				};
			},
			
			idealBB: function () {
				return null;
			},
			
			recomputeBB: function () {
				var idealBB = this.idealBB();
				if (!idealBB)
					return;
				var actualBB = this.computeActualBB(idealBB);
				this._idealBB = idealBB;
				this._actualBB = actualBB;
				this.setActualBB(actualBB);
			},
			
			setActualBB: function (actualBB) {}
			
		};
	});
});
