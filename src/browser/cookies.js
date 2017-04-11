Scoped.define("module:Cookies", ["base:Objs", "base:Types"], function(Objs, Types) {
    return {

        getCookielikeValue: function(cookies, key) {
            return decodeURIComponent(cookies.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },

        get: function(key) {
            return this.getCookielikeValue(document.cookie, key);
        },

        createCookielikeValue: function(key, value, end, path, domain, secure) {
            if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key))
                return null;
            var components = [];
            components.push([encodeURIComponent(key), encodeURIComponent(value)]);
            if (end) {
                if (end === Infinity)
                    components.push(["expires", "Fri, 31 Dec 9999 23:59:59 GMT"]);
                else if (typeof end === "number")
                    components.push(["max-age", end]);
                else if (typeof end === "object")
                    components.push(["expires", end.toUTCString()]);
                else
                    components.push(["expires", end]);
            }
            if (domain)
                components.push(["domain", domain]);
            if (path)
                components.push(["path", path]);
            if (secure)
                components.push("secure");
            return Objs.map(components, function(component) {
                return Types.is_array(component) ? component.join("=") : component;
            }).join("; ");
        },

        set: function(key, value, end, path, domain, secure) {
            document.cookie = this.createCookielikeValue(key, value, end, path, domain, secure);
        },

        removeCookielikeValue: function(key, value, path, domain) {
            return this.createCookielikeValue(key, value, new Date(0), path, domain);
        },

        remove: function(key, value, path, domain) {
            document.cookie = this.removeCookielikeValue(key, value, path, domain);
        },

        hasCookielikeValue: function(cookies, key) {
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(cookies);
        },

        has: function(key) {
            return this.hasCookielikeValue(document.cookie, key);
        },

        keysCookielike: function(cookies) {
            var base = cookies.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            return Objs.map(base, decodeURIComponent);
        },

        keys: function() {
            return this.keysCookielike(document.cookie);
        }

    };
});