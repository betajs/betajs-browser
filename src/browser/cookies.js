Scoped.define("module:Cookies", ["base:Net.Cookies"], function(Cookies) {
    return {

        get: function(key) {
            return Cookies.getCookielikeValue(document.cookie, key);
        },

        set: function(key, value, end, path, domain, secure) {
            document.cookie = Cookies.createCookielikeValue(key, value, end, path, domain, secure);
        },

        remove: function(key, value, path, domain) {
            document.cookie = Cookies.removeCookielikeValue(key, value, path, domain);
        },

        has: function(key) {
            return Cookies.hasCookielikeValue(document.cookie, key);
        },

        keys: function() {
            return Cookies.keysCookielike(document.cookie);
        }

    };
});