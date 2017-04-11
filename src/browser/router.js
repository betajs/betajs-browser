Scoped.define("module:HashRouteBinder", [
    "base:Router.RouteBinder",
    "module:Events"
], function(RouteBinder, Events, scoped) {
    return RouteBinder.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(router) {
                inherited.constructor.call(this, router);
                var events = this.auto_destroy(new Events());
                events.on(window, "hashchange", function() {
                    this._localRouteChanged();
                }, this);
            },

            _getLocalRoute: function() {
                var hash = window.location.hash;
                return (hash.length && hash[0] == '#') ? hash.slice(1) : hash;
            },

            _setLocalRoute: function(currentRoute) {
                window.location.hash = "#" + currentRoute.route;
            }

        };
    });
});


Scoped.define("module:HistoryRouteBinder", [
    "base:Router.RouteBinder",
    "module:Events"
], function(RouteBinder, Events, scoped) {
    return RouteBinder.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            __used: false,

            constructor: function(router) {
                inherited.constructor.call(this, router);
                var events = this.auto_destroy(new Events());
                events.on(window, "hashchange", function() {
                    if (this.__used)
                        this._localRouteChanged();
                }, this);
            },

            _getLocalRoute: function() {
                return window.location.pathname;
            },

            _setLocalRoute: function(currentRoute) {
                window.history.pushState({}, document.title, currentRoute.route);
                this.__used = true;
            }

        };
    }, {
        supported: function() {
            return window.history && window.history.pushState;
        }
    });
});


Scoped.define("module:LocationRouteBinder", [
    "base:Router.RouteBinder"
], function(RouteBinder, scoped) {
    return RouteBinder.extend({
        scoped: scoped
    }, {

        _getLocalRoute: function() {
            return window.location.pathname;
        },

        _setLocalRoute: function(currentRoute) {
            window.location.pathname = currentRoute.route;
        }

    });
});