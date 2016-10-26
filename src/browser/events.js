Scoped.define("module:Events", [
    "base:Class",
    "base:Objs",
    "base:Functions"
], function (Class, Objs, Functions, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function () {
				inherited.constructor.call(this);
				this.__callbacks = {};
			},
			
			destroy: function () {
				Objs.iter(this.__callbacks, function (entries, event) {
					entries.forEach(function (entry) {
						entry.element.removeEventListener(event, entry.callback_function, false);
					});
				});
				inherited.destroy.call(this);
			},
			
			on: function (element, event, callback, context) {
				var callback_function = callback;
				if (context)
					callback_function = Functions.as_method(callback, context);
				element.addEventListener(event, callback_function, false);
				this.__callbacks[event] = this.__callbacks[event] || [];
				this.__callbacks[event].push({
					element: element,
					callback_function: callback_function,
					callback: callback,
					context: context
				});
				return this;
			},
			
			off: function (element, event, callback, context) {
				var entries = this.__callbacks[event];
				if (entries) {
					var i = 0;
					while (i < entries.length) {
						var entry = entries[i];
						if ((!element || element == entry.element) && (!callback || callback == entry.callback) && (!context || context == entry.context)) {
							entry.element.removeEventListener(event, entry.callback_function, false);
							entries[i] = entries[entries.length - 1];
							entries.pop();
						} else
							++i;
					}
				}
				return this;
			}
			
		};
	});	
});