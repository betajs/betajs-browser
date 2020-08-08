Scoped.define("module:Cookies", ["base:Net.Cookies"], function(Cookies) {
    return {

        get: function(key) {
            return Cookies.getCookielikeValue(document.cookie, key);
        },

        /**
         * Will set the Cookie with provided settings
         *
         * @param {string} key
         * @param {string} value
         * @param {Date} end
         * @param {string} path
         * @param {string} domain
         * @param {boolean} secure
         * @param {'None'|'Lax'|'Strict'} sameSite
         */
        set: function(key, value, end, path, domain, secure, sameSite) {
            document.cookie = Cookies.createCookielikeValue(key, value, end, path, domain, secure, sameSite);
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