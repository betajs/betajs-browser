Scoped.define("module:Cookies", ["base:Strings"], function (Strings) {
	return {		
	
		get : function(key) {
			return Strings.read_cookie_string(document.cookie, key);
		},
	
		set : function(key, value) {
			document.cookie = Strings.write_cookie_string(document.cookie, key, value);
		}
		
	};
});