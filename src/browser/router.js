Scoped.define("module:HashRouteBinder", ["base:Router.RouteBinder", "jquery:"], function (RouteBinder, $, scoped) {
	return RouteBinder.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (router) {
				inherited.constructor.call(this, router);
				var self = this;
				$(window).on("hashchange.events" + this.cid(), function () {
					self._setRoute(self._getExternalRoute());
				});
			},
			
			destroy: function () {				
				$(window).off("hashchange.events" + this.cid());
				inherited.destroy.call(this);
			},
			
			_getExternalRoute: function () {
				var hash = window.location.hash;
				return (hash.length && hash[0] == '#') ? hash.slice(1) : hash;
			},
			
			_setExternalRoute: function (route) {
				window.location.hash = "#" + route;
			}
			
		};
	});
});


Scoped.define("module:HistoryRouteBinder", ["base:Router.RouteBinder", "jquery:"], function (RouteBinder, $, scoped) {
	return RouteBinder.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (router) {
				inherited.constructor.call(this, router);
				var self = this;
				this.__used = false;
				$(window).on("popstate.events" + this.cid(), function () {
					if (self.__used)
						self._setRoute(self._getExternalRoute());
				});
			},
			
			destroy: function () {
				$(window).off("popstate.events" + this.cid());
				inherited.destroy.call(this);
			},
		
			_getExternalRoute: function () {
				return window.location.pathname;
			},
			
			_setExternalRoute: function (route) {
				window.history.pushState({}, document.title, route);
				this.__used = true;
			}
		};
	}, {
		supported: function () {
			return window.history && window.history.pushState;
		}
	});
});


Scoped.define("module:LocationRouteBinder", ["base:Router.RouteBinder"], function (RouteBinder, scoped) {
	return RouteBinder.extend({scoped: scoped}, {
		
		_getExternalRoute: function () {
			return window.location.pathname;
		},
		
		_setExternalRoute: function (route) {
			window.location.pathname = route;
		}
		
	});
});
