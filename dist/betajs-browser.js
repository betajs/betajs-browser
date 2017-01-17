/*!
betajs-browser - v1.0.62 - 2017-01-17
Copyright (c) Oliver Friedmann
Apache-2.0 Software License.
*/
/** @flow **//*!
betajs-scoped - v0.0.13 - 2017-01-15
Copyright (c) Oliver Friedmann
Apache-2.0 Software License.
*/
var Scoped = (function () {
var Globals = (function () {  
/** 
 * This helper module provides functions for reading and writing globally accessible namespaces, both in the browser and in NodeJS.
 * 
 * @module Globals
 * @access private
 */
return { 
		
	/**
	 * Returns the value of a global variable.
	 * 
	 * @param {string} key identifier of a global variable
	 * @return value of global variable or undefined if not existing
	 */
	get : function(key/* : string */) {
		if (typeof window !== "undefined")
			return window[key];
		if (typeof global !== "undefined")
			return global[key];
		if (typeof self !== "undefined")
			return self[key];
		return undefined;
	},

	
	/**
	 * Sets a global variable.
	 * 
	 * @param {string} key identifier of a global variable
	 * @param value value to be set
	 * @return value that has been set
	 */
	set : function(key/* : string */, value) {
		if (typeof window !== "undefined")
			window[key] = value;
		if (typeof global !== "undefined")
			global[key] = value;
		if (typeof self !== "undefined")
			self[key] = value;
		return value;
	},
	
	
	/**
	 * Returns the value of a global variable under a namespaced path.
	 * 
	 * @param {string} path namespaced path identifier of variable
	 * @return value of global variable or undefined if not existing
	 * 
	 * @example
	 * // returns window.foo.bar / global.foo.bar 
	 * Globals.getPath("foo.bar")
	 */
	getPath: function (path/* : string */) {
		var args = path.split(".");
		if (args.length == 1)
			return this.get(path);		
		var current = this.get(args[0]);
		for (var i = 1; i < args.length; ++i) {
			if (!current)
				return current;
			current = current[args[i]];
		}
		return current;
	},


	/**
	 * Sets a global variable under a namespaced path.
	 * 
	 * @param {string} path namespaced path identifier of variable
	 * @param value value to be set
	 * @return value that has been set
	 * 
	 * @example
	 * // sets window.foo.bar / global.foo.bar 
	 * Globals.setPath("foo.bar", 42);
	 */
	setPath: function (path/* : string */, value) {
		var args = path.split(".");
		if (args.length == 1)
			return this.set(path, value);		
		var current = this.get(args[0]) || this.set(args[0], {});
		for (var i = 1; i < args.length - 1; ++i) {
			if (!(args[i] in current))
				current[args[i]] = {};
			current = current[args[i]];
		}
		current[args[args.length - 1]] = value;
		return value;
	}
	
};}).call(this);
/*::
declare module Helper {
	declare function extend<A, B>(a: A, b: B): A & B;
}
*/

var Helper = (function () {  
/** 
 * This helper module provides auxiliary functions for the Scoped system.
 * 
 * @module Helper
 * @access private
 */
return { 
		
	/**
	 * Attached a context to a function.
	 * 
	 * @param {object} obj context for the function
	 * @param {function} func function
	 * 
	 * @return function with attached context
	 */
	method: function (obj, func) {
		return function () {
			return func.apply(obj, arguments);
		};
	},

	
	/**
	 * Extend a base object with all attributes of a second object.
	 * 
	 * @param {object} base base object
	 * @param {object} overwrite second object
	 * 
	 * @return {object} extended base object
	 */
	extend: function (base, overwrite) {
		base = base || {};
		overwrite = overwrite || {};
		for (var key in overwrite)
			base[key] = overwrite[key];
		return base;
	},
	
	
	/**
	 * Returns the type of an object, particulary returning 'array' for arrays.
	 * 
	 * @param obj object in question
	 * 
	 * @return {string} type of object
	 */
	typeOf: function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]' ? "array" : typeof obj;
	},
	
	
	/**
	 * Returns whether an object is null, undefined, an empty array or an empty object.
	 * 
	 * @param obj object in question
	 * 
	 * @return true if object is empty
	 */
	isEmpty: function (obj) {
		if (obj === null || typeof obj === "undefined")
			return true;
		if (this.typeOf(obj) == "array")
			return obj.length === 0;
		if (typeof obj !== "object")
			return false;
		for (var key in obj)
			return false;
		return true;
	},
	
	
    /**
     * Matches function arguments against some pattern.
     * 
     * @param {array} args function arguments
     * @param {object} pattern typed pattern
     * 
     * @return {object} matched arguments as associative array 
     */	
	matchArgs: function (args, pattern) {
		var i = 0;
		var result = {};
		for (var key in pattern) {
			if (pattern[key] === true || this.typeOf(args[i]) == pattern[key]) {
				result[key] = args[i];
				i++;
			} else if (this.typeOf(args[i]) == "undefined")
				i++;
		}
		return result;
	},
	
	
	/**
	 * Stringifies a value as JSON and functions to string representations.
	 * 
	 * @param value value to be stringified
	 * 
	 * @return stringified value
	 */
	stringify: function (value) {
		if (this.typeOf(value) == "function")
			return "" + value;
		return JSON.stringify(value);
	}	

	
};}).call(this);
var Attach = (function () {  
/** 
 * This module provides functionality to attach the Scoped system to the environment.
 * 
 * @module Attach
 * @access private
 */
return { 
		
	__namespace: "Scoped",
	__revert: null,
	
	
	/**
	 * Upgrades a pre-existing Scoped system to the newest version present. 
	 * 
	 * @param {string} namespace Optional namespace (default is 'Scoped')
	 * @return {object} the attached Scoped system
	 */
	upgrade: function (namespace/* : ?string */) {
		var current = Globals.get(namespace || Attach.__namespace);
		if (current && Helper.typeOf(current) == "object" && current.guid == this.guid && Helper.typeOf(current.version) == "string") {
			var my_version = this.version.split(".");
			var current_version = current.version.split(".");
			var newer = false;
			for (var i = 0; i < Math.min(my_version.length, current_version.length); ++i) {
				newer = parseInt(my_version[i], 10) > parseInt(current_version[i], 10);
				if (my_version[i] != current_version[i]) 
					break;
			}
			return newer ? this.attach(namespace) : current;				
		} else
			return this.attach(namespace);		
	},


	/**
	 * Attaches the Scoped system to the environment. 
	 * 
	 * @param {string} namespace Optional namespace (default is 'Scoped')
	 * @return {object} the attached Scoped system
	 */
	attach : function(namespace/* : ?string */) {
		if (namespace)
			Attach.__namespace = namespace;
		var current = Globals.get(Attach.__namespace);
		if (current == this)
			return this;
		Attach.__revert = current;
		if (current) {
			try {
				var exported = current.__exportScoped();
				this.__exportBackup = this.__exportScoped();
				this.__importScoped(exported);
			} catch (e) {
				// We cannot upgrade the old version.
			}
		}
		Globals.set(Attach.__namespace, this);
		return this;
	},
	

	/**
	 * Detaches the Scoped system from the environment. 
	 * 
	 * @param {boolean} forceDetach Overwrite any attached scoped system by null.
	 * @return {object} the detached Scoped system
	 */
	detach: function (forceDetach/* : ?boolean */) {
		if (forceDetach)
			Globals.set(Attach.__namespace, null);
		if (typeof Attach.__revert != "undefined")
			Globals.set(Attach.__namespace, Attach.__revert);
		delete Attach.__revert;
		if (Attach.__exportBackup)
			this.__importScoped(Attach.__exportBackup);
		return this;
	},
	

	/**
	 * Exports an object as a module if possible. 
	 * 
	 * @param {object} mod a module object (optional, default is 'module')
	 * @param {object} object the object to be exported
	 * @param {boolean} forceExport overwrite potentially pre-existing exports
	 * @return {object} the Scoped system
	 */
	exports: function (mod, object, forceExport) {
		mod = mod || (typeof module != "undefined" ? module : null);
		if (typeof mod == "object" && mod && "exports" in mod && (forceExport || mod.exports == this || !mod.exports || Helper.isEmpty(mod.exports)))
			mod.exports = object || this;
		return this;
	}	

};}).call(this);

function newNamespace (opts/* : {tree ?: boolean, global ?: boolean, root ?: Object} */) {

	var options/* : {
		tree: boolean,
	    global: boolean,
	    root: Object
	} */ = {
		tree: typeof opts.tree === "boolean" ? opts.tree : false,
		global: typeof opts.global === "boolean" ? opts.global : false,
		root: typeof opts.root === "object" ? opts.root : {}
	};

	/*::
	type Node = {
		route: ?string,
		parent: ?Node,
		children: any,
		watchers: any,
		data: any,
		ready: boolean,
		lazy: any
	};
	*/

	function initNode(options)/* : Node */ {
		return {
			route: typeof options.route === "string" ? options.route : null,
			parent: typeof options.parent === "object" ? options.parent : null,
			ready: typeof options.ready === "boolean" ? options.ready : false,
			children: {},
			watchers: [],
			data: {},
			lazy: []
		};
	}
	
	var nsRoot = initNode({ready: true});
	
	if (options.tree) {
		if (options.global) {
			try {
				if (window)
					nsRoot.data = window;
			} catch (e) { }
			try {
				if (global)
					nsRoot.data = global;
			} catch (e) { }
			try {
				if (self)
					nsRoot.data = self;
			} catch (e) { }
		} else
			nsRoot.data = options.root;
	}
	
	function nodeDigest(node/* : Node */) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready) {
			nodeDigest(node.parent);
			return;
		}
		if (node.route && node.parent && (node.route in node.parent.data)) {
			node.data = node.parent.data[node.route];
			node.ready = true;
			for (var i = 0; i < node.watchers.length; ++i)
				node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
			node.watchers = [];
			for (var key in node.children)
				nodeDigest(node.children[key]);
		}
	}
	
	function nodeEnforce(node/* : Node */) {
		if (node.ready)
			return;
		if (node.parent && !node.parent.ready)
			nodeEnforce(node.parent);
		node.ready = true;
		if (node.parent) {
			if (options.tree && typeof node.parent.data == "object")
				node.parent.data[node.route] = node.data;
		}
		for (var i = 0; i < node.watchers.length; ++i)
			node.watchers[i].callback.call(node.watchers[i].context || this, node.data);
		node.watchers = [];
	}
	
	function nodeSetData(node/* : Node */, value) {
		if (typeof value == "object" && node.ready) {
			for (var key in value)
				node.data[key] = value[key];
		} else
			node.data = value;
		if (typeof value == "object") {
			for (var ckey in value) {
				if (node.children[ckey])
					node.children[ckey].data = value[ckey];
			}
		}
		nodeEnforce(node);
		for (var k in node.children)
			nodeDigest(node.children[k]);
	}
	
	function nodeClearData(node/* : Node */) {
		if (node.ready && node.data) {
			for (var key in node.data)
				delete node.data[key];
		}
	}
	
	function nodeNavigate(path/* : ?String */) {
		if (!path)
			return nsRoot;
		var routes = path.split(".");
		var current = nsRoot;
		for (var i = 0; i < routes.length; ++i) {
			if (routes[i] in current.children)
				current = current.children[routes[i]];
			else {
				current.children[routes[i]] = initNode({
					parent: current,
					route: routes[i]
				});
				current = current.children[routes[i]];
				nodeDigest(current);
			}
		}
		return current;
	}
	
	function nodeAddWatcher(node/* : Node */, callback, context) {
		if (node.ready)
			callback.call(context || this, node.data);
		else {
			node.watchers.push({
				callback: callback,
				context: context
			});
			if (node.lazy.length > 0) {
				var f = function (node) {
					if (node.lazy.length > 0) {
						var lazy = node.lazy.shift();
						lazy.callback.call(lazy.context || this, node.data);
						f(node);
					}
				};
				f(node);
			}
		}
	}
	
	function nodeUnresolvedWatchers(node/* : Node */, base, result) {
		node = node || nsRoot;
		result = result || [];
		if (!node.ready)
			result.push(base);
		for (var k in node.children) {
			var c = node.children[k];
			var r = (base ? base + "." : "") + c.route;
			result = nodeUnresolvedWatchers(c, r, result);
		}
		return result;
	}

	/** 
	 * The namespace module manages a namespace in the Scoped system.
	 * 
	 * @module Namespace
	 * @access public
	 */
	return {
		
		/**
		 * Extend a node in the namespace by an object.
		 * 
		 * @param {string} path path to the node in the namespace
		 * @param {object} value object that should be used for extend the namespace node
		 */
		extend: function (path, value) {
			nodeSetData(nodeNavigate(path), value);
		},
		
		/**
		 * Set the object value of a node in the namespace.
		 * 
		 * @param {string} path path to the node in the namespace
		 * @param {object} value object that should be used as value for the namespace node
		 */
		set: function (path, value) {
			var node = nodeNavigate(path);
			if (node.data)
				nodeClearData(node);
			nodeSetData(node, value);
		},
		
		/**
		 * Read the object value of a node in the namespace.
		 * 
		 * @param {string} path path to the node in the namespace
		 * @return {object} object value of the node or null if undefined
		 */
		get: function (path) {
			var node = nodeNavigate(path);
			return node.ready ? node.data : null;
		},
		
		/**
		 * Lazily navigate to a node in the namespace.
		 * Will asynchronously call the callback as soon as the node is being touched.
		 *
		 * @param {string} path path to the node in the namespace
		 * @param {function} callback callback function accepting the node's object value
		 * @param {context} context optional callback context
		 */
		lazy: function (path, callback, context) {
			var node = nodeNavigate(path);
			if (node.ready)
				callback(context || this, node.data);
			else {
				node.lazy.push({
					callback: callback,
					context: context
				});
			}
		},
		
		/**
		 * Digest a node path, checking whether it has been defined by an external system.
		 * 
		 * @param {string} path path to the node in the namespace
		 */
		digest: function (path) {
			nodeDigest(nodeNavigate(path));
		},
		
		/**
		 * Asynchronously access a node in the namespace.
		 * Will asynchronously call the callback as soon as the node is being defined.
		 *
		 * @param {string} path path to the node in the namespace
		 * @param {function} callback callback function accepting the node's object value
		 * @param {context} context optional callback context
		 */
		obtain: function (path, callback, context) {
			nodeAddWatcher(nodeNavigate(path), callback, context);
		},
		
		/**
		 * Returns all unresolved watchers under a certain path.
		 * 
		 * @param {string} path path to the node in the namespace
		 * @return {array} list of all unresolved watchers 
		 */
		unresolvedWatchers: function (path) {
			return nodeUnresolvedWatchers(nodeNavigate(path), path);
		},
		
		__export: function () {
			return {
				options: options,
				nsRoot: nsRoot
			};
		},
		
		__import: function (data) {
			options = data.options;
			nsRoot = data.nsRoot;
		}
		
	};
	
}
function newScope (parent, parentNS, rootNS, globalNS) {
	
	var self = this;
	var nextScope = null;
	var childScopes = [];
	var parentNamespace = parentNS;
	var rootNamespace = rootNS;
	var globalNamespace = globalNS;
	var localNamespace = newNamespace({tree: true});
	var privateNamespace = newNamespace({tree: false});
	
	var bindings = {
		"global": {
			namespace: globalNamespace
		}, "root": {
			namespace: rootNamespace
		}, "local": {
			namespace: localNamespace
		}, "default": {
			namespace: privateNamespace
		}, "parent": {
			namespace: parentNamespace
		}, "scope": {
			namespace: localNamespace,
			readonly: false
		}
	};
	
	var custom = function (argmts, name, callback) {
		var args = Helper.matchArgs(argmts, {
			options: "object",
			namespaceLocator: true,
			dependencies: "array",
			hiddenDependencies: "array",
			callback: true,
			context: "object"
		});
		
		var options = Helper.extend({
			lazy: this.options.lazy
		}, args.options || {});
		
		var ns = this.resolve(args.namespaceLocator);
		
		var execute = function () {
			this.require(args.dependencies, args.hiddenDependencies, function () {
				arguments[arguments.length - 1].ns = ns;
				if (this.options.compile) {
					var params = [];
					for (var i = 0; i < argmts.length; ++i)
						params.push(Helper.stringify(argmts[i]));
					this.compiled += this.options.ident + "." + name + "(" + params.join(", ") + ");\n\n";
				}
				if (this.options.dependencies) {
					this.dependencies[ns.path] = this.dependencies[ns.path] || {};
					if (args.dependencies) {
						args.dependencies.forEach(function (dep) {
							this.dependencies[ns.path][this.resolve(dep).path] = true;
						}, this);
					}
					if (args.hiddenDependencies) {
						args.hiddenDependencies.forEach(function (dep) {
							this.dependencies[ns.path][this.resolve(dep).path] = true;
						}, this);
					}
				}
				var result = this.options.compile ? {} : args.callback.apply(args.context || this, arguments);
				callback.call(this, ns, result);
			}, this);
		};
		
		if (options.lazy)
			ns.namespace.lazy(ns.path, execute, this);
		else
			execute.apply(this);

		return this;
	};
	
	/** 
	 * This module provides all functionality in a scope.
	 * 
	 * @module Scoped
	 * @access public
	 */
	return {
		
		getGlobal: Helper.method(Globals, Globals.getPath),
		setGlobal: Helper.method(Globals, Globals.setPath),
		
		options: {
			lazy: false,
			ident: "Scoped",
			compile: false,
			dependencies: false
		},
		
		compiled: "",
		
		dependencies: {},
		
		
		/**
		 * Returns a reference to the next scope that will be obtained by a subScope call.
		 * 
		 * @return {object} next scope
		 */
		nextScope: function () {
			if (!nextScope)
				nextScope = newScope(this, localNamespace, rootNamespace, globalNamespace);
			return nextScope;
		},
		
		/**
		 * Creates a sub scope of the current scope and returns it.
		 * 
		 * @return {object} sub scope
		 */
		subScope: function () {
			var sub = this.nextScope();
			childScopes.push(sub);
			nextScope = null;
			return sub;
		},
		
		/**
		 * Creates a binding within in the scope. 
		 * 
		 * @param {string} alias identifier of the new binding
		 * @param {string} namespaceLocator identifier of an existing namespace path
		 * @param {object} options options for the binding
		 * 
		 */
		binding: function (alias, namespaceLocator, options) {
			if (!bindings[alias] || !bindings[alias].readonly) {
				var ns;
				if (Helper.typeOf(namespaceLocator) != "string") {
					ns = {
						namespace: newNamespace({
							tree: true,
							root: namespaceLocator
						}),
						path: null	
					};
				} else
					ns = this.resolve(namespaceLocator);
				bindings[alias] = Helper.extend(options, ns);
			}
			return this;
		},
		
		
		/**
		 * Resolves a name space locator to a name space.
		 * 
		 * @param {string} namespaceLocator name space locator
		 * @return {object} resolved name space
		 * 
		 */
		resolve: function (namespaceLocator) {
			var parts = namespaceLocator.split(":");
			if (parts.length == 1) {
				return {
					namespace: privateNamespace,
					path: parts[0]
				};
			} else {
				var binding = bindings[parts[0]];
				if (!binding)
					throw ("The namespace '" + parts[0] + "' has not been defined (yet).");
				return {
					namespace: binding.namespace,
					path : binding.path && parts[1] ? binding.path + "." + parts[1] : (binding.path || parts[1])
				};
			}
		},

		
		/**
		 * Defines a new name space once a list of name space locators is available.
		 * 
		 * @param {string} namespaceLocator the name space that is to be defined
		 * @param {array} dependencies a list of name space locator dependencies (optional)
		 * @param {array} hiddenDependencies a list of hidden name space locators (optional)
		 * @param {function} callback a callback function accepting all dependencies as arguments and returning the new definition
		 * @param {object} context a callback context (optional)
		 * 
		 */
		define: function () {
			return custom.call(this, arguments, "define", function (ns, result) {
				if (ns.namespace.get(ns.path))
					throw ("Scoped namespace " + ns.path + " has already been defined. Use extend to extend an existing namespace instead");
				ns.namespace.set(ns.path, result);
			});
		},
		
		
		/**
		 * Assume a specific version of a module and fail if it is not met.
		 * 
		 * @param {string} assumption name space locator
		 * @param {string} version assumed version
		 * 
		 */
		assumeVersion: function () {
			var args = Helper.matchArgs(arguments, {
				assumption: true,
				dependencies: "array",
				callback: true,
				context: "object",
				error: "string"
			});
			var dependencies = args.dependencies || [];
			dependencies.unshift(args.assumption);
			this.require(dependencies, function () {
				var argv = arguments;
				var assumptionValue = argv[0].replace(/[^\d\.]/g, "");
				argv[0] = assumptionValue.split(".");
				for (var i = 0; i < argv[0].length; ++i)
					argv[0][i] = parseInt(argv[0][i], 10);
				if (Helper.typeOf(args.callback) === "function") {
					if (!args.callback.apply(args.context || this, args))
						throw ("Scoped Assumption '" + args.assumption + "' failed, value is " + assumptionValue + (args.error ? ", but assuming " + args.error : ""));
				} else {
					var version = (args.callback + "").replace(/[^\d\.]/g, "").split(".");
					for (var j = 0; j < Math.min(argv[0].length, version.length); ++j)
						if (parseInt(version[j], 10) > argv[0][j])
							throw ("Scoped Version Assumption '" + args.assumption + "' failed, value is " + assumptionValue + ", but assuming at least " + args.callback);
				}
			});
		},
		
		
		/**
		 * Extends a potentiall existing name space once a list of name space locators is available.
		 * 
		 * @param {string} namespaceLocator the name space that is to be defined
		 * @param {array} dependencies a list of name space locator dependencies (optional)
		 * @param {array} hiddenDependencies a list of hidden name space locators (optional)
		 * @param {function} callback a callback function accepting all dependencies as arguments and returning the new additional definitions.
		 * @param {object} context a callback context (optional)
		 * 
		 */
		extend: function () {
			return custom.call(this, arguments, "extend", function (ns, result) {
				ns.namespace.extend(ns.path, result);
			});
		},
				
		
		/**
		 * Requires a list of name space locators and calls a function once they are present.
		 * 
		 * @param {array} dependencies a list of name space locator dependencies (optional)
		 * @param {array} hiddenDependencies a list of hidden name space locators (optional)
		 * @param {function} callback a callback function accepting all dependencies as arguments
		 * @param {object} context a callback context (optional)
		 * 
		 */
		require: function () {
			var args = Helper.matchArgs(arguments, {
				dependencies: "array",
				hiddenDependencies: "array",
				callback: "function",
				context: "object"
			});
			args.callback = args.callback || function () {};
			var dependencies = args.dependencies || [];
			var allDependencies = dependencies.concat(args.hiddenDependencies || []);
			var count = allDependencies.length;
			var deps = [];
			var environment = {};
			if (count) {
				var f = function (value) {
					if (this.i < deps.length)
						deps[this.i] = value;
					count--;
					if (count === 0) {
						deps.push(environment);
						args.callback.apply(args.context || this.ctx, deps);
					}
				};
				for (var i = 0; i < allDependencies.length; ++i) {
					var ns = this.resolve(allDependencies[i]);
					if (i < dependencies.length)
						deps.push(null);
					ns.namespace.obtain(ns.path, f, {
						ctx: this,
						i: i
					});
				}
			} else {
				deps.push(environment);
				args.callback.apply(args.context || this, deps);
			}
			return this;
		},

		
		/**
		 * Digest a name space locator, checking whether it has been defined by an external system.
		 * 
		 * @param {string} namespaceLocator name space locator
		 */
		digest: function (namespaceLocator) {
			var ns = this.resolve(namespaceLocator);
			ns.namespace.digest(ns.path);
			return this;
		},
		
		
		/**
		 * Returns all unresolved definitions under a namespace locator
		 * 
		 * @param {string} namespaceLocator name space locator, e.g. "global:"
		 * @return {array} list of all unresolved definitions 
		 */
		unresolved: function (namespaceLocator) {
			var ns = this.resolve(namespaceLocator);
			return ns.namespace.unresolvedWatchers(ns.path);
		},
		
		/**
		 * Exports the scope.
		 * 
		 * @return {object} exported scope
		 */
		__export: function () {
			return {
				parentNamespace: parentNamespace.__export(),
				rootNamespace: rootNamespace.__export(),
				globalNamespace: globalNamespace.__export(),
				localNamespace: localNamespace.__export(),
				privateNamespace: privateNamespace.__export()
			};
		},
		
		/**
		 * Imports a scope from an exported scope.
		 * 
		 * @param {object} data exported scope to be imported
		 * 
		 */
		__import: function (data) {
			parentNamespace.__import(data.parentNamespace);
			rootNamespace.__import(data.rootNamespace);
			globalNamespace.__import(data.globalNamespace);
			localNamespace.__import(data.localNamespace);
			privateNamespace.__import(data.privateNamespace);
		}
		
	};
	
}
var globalNamespace = newNamespace({tree: true, global: true});
var rootNamespace = newNamespace({tree: true});
var rootScope = newScope(null, rootNamespace, rootNamespace, globalNamespace);

var Public = Helper.extend(rootScope, (function () {  
/** 
 * This module includes all public functions of the Scoped system.
 * 
 * It includes all methods of the root scope and the Attach module.
 * 
 * @module Public
 * @access public
 */
return {
		
	guid: "4b6878ee-cb6a-46b3-94ac-27d91f58d666",
	version: '0.0.13',
		
	upgrade: Attach.upgrade,
	attach: Attach.attach,
	detach: Attach.detach,
	exports: Attach.exports,
	
	/**
	 * Exports all data contained in the Scoped system.
	 * 
	 * @return data of the Scoped system.
	 * @access private
	 */
	__exportScoped: function () {
		return {
			globalNamespace: globalNamespace.__export(),
			rootNamespace: rootNamespace.__export(),
			rootScope: rootScope.__export()
		};
	},
	
	/**
	 * Import data into the Scoped system.
	 * 
	 * @param data of the Scoped system.
	 * @access private
	 */
	__importScoped: function (data) {
		globalNamespace.__import(data.globalNamespace);
		rootNamespace.__import(data.rootNamespace);
		rootScope.__import(data.rootScope);
	}
	
};

}).call(this));

Public = Public.upgrade();
Public.exports();
	return Public;
}).call(this);
/*!
betajs-browser - v1.0.62 - 2017-01-17
Copyright (c) Oliver Friedmann
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS.Browser');
Scoped.binding('base', 'global:BetaJS');
Scoped.define("module:", function () {
	return {
    "guid": "02450b15-9bbf-4be2-b8f6-b483bc015d06",
    "version": "1.0.62"
};
});
Scoped.assumeVersion('base:version', '~1.0.96');
Scoped.define("module:Ajax.IframePostmessageAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Ajax.RequestException",
    "base:Tokens",
    "base:Objs"
], function (AjaxSupport, Uri, HttpHeader, Promise, Types, RequestException, Tokens, Objs) {
	
	var id = 1;
	
	var Module = {
		
		supports: function (options) {
			if (!options.postmessage)
				return false;
			return true;
		},
		
		execute: function (options) {
			var postmessageName = "postmessage_" + Tokens.generate_token() + "_" + (id++);
			var params = Objs.objectBy(options.postmessage, postmessageName);
			params = Objs.extend(params, options.query);
			var uri = Uri.appendUriParams(options.uri, params);
			var iframe = document.createElement("iframe");
			iframe.id = postmessageName;
			iframe.name = postmessageName;
			iframe.style.display = "none";
			var form = document.createElement("form");
			form.method = options.method;
			form.target = postmessageName;
			form.action = uri;
			form.style.display = "none";
			var promise = Promise.create();
			document.body.appendChild(iframe);
			document.body.appendChild(form);
			Objs.iter(options.data, function (value, key) {
				var input = document.createElement("input");
				input.type = "hidden";
				input.name = key;
				input.value = Types.is_array(value) || Types.is_object(value) ? JSON.stringify(value) : value;
				form.appendChild(input);				
			}, this);
			var post_message_fallback = !("postMessage" in window);
			var self = this;
			var handle_success = null;
			var message_event_handler = function (event) {
				handle_success(event.data);
			};
			handle_success = function (raw_data) {
				if (typeof raw_data === "string")
					raw_data = JSON.parse(raw_data);
				if (!(postmessageName in raw_data))
					return;
				raw_data = raw_data[postmessageName];
				if (post_message_fallback)
					window.postMessage = null;
				window.removeEventListener("message", message_event_handler, false);
				document.body.removeChild(form);
				document.body.removeChild(iframe);				
				AjaxSupport.promiseReturnData(promise, options, raw_data, "json"); //options.decodeType);
			};
			iframe.onerror = function () {
				if (post_message_fallback)
					window.postMessage = null;
				window.removeEventListener("message", message_event_handler, false);
				document.body.removeChild(form);
				document.body.removeChild(iframe);
				// TODO
				//AjaxSupport.promiseRequestException(promise, xmlhttp.status, xmlhttp.statusText, xmlhttp.responseText, "json"); //options.decodeType);)
			};				
			window.addEventListener("message", message_event_handler, false);
			if (post_message_fallback) 
				window.postMessage = handle_success;
			form.submit();			
			return promise;
		}
			
	};
	
	AjaxSupport.register(Module, 4);
	
	return Module;
});


Scoped.define("module:Ajax.JsonpScriptAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Ajax.RequestException",
    "base:Tokens",
    "base:Objs",
    "base:Async",
    "module:Info"
], function (AjaxSupport, Uri, HttpHeader, Promise, Types, RequestException, Tokens, Objs, Async, Info) {
	
	var id = 1;
	
	var Module = {
		
		supports: function (options) {
			if (!options.jsonp)
				return false;
			if (options.method !== "GET")
				return false;
			return true;
		},
		
		execute: function (options) {
			var callbackName = "jsonp_" + Tokens.generate_token() + "_" + (id++);
			var params = Objs.objectBy(options.jsonp, callbackName);
			params = Objs.extend(params, options.query);
			params = Objs.extend(params, options.data);
			var uri = Uri.appendUriParams(options.uri, params);
			var hasResult = false;
			
			window[callbackName] = function (data) {
				if (hasResult)
					return;
				hasResult = true;
				try {
					delete window[callbackName];
				} catch (e) {
					window[callbackName] = undefined;
				}
				AjaxSupport.promiseReturnData(promise, options, data, "json"); //options.decodeType);
			};
			
			var promise = Promise.create();
			
			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");
			var executed = false; 
			script.onerror = function (event) {
				if (event.stopPropagation)
					event.stopPropagation();
				else
					event.cancelBubble = true;
				if (hasResult)
					return;
				hasResult = true;
				AjaxSupport.promiseRequestException(promise, HttpHeader.HTTP_STATUS_BAD_REQUEST, HttpHeader.format(HttpHeader.HTTP_STATUS_BAD_REQUEST), null, "json"); //options.decodeType);)
			};			
			script.onload = script.onreadystatechange = function() {
				if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					executed = true;
					script.onload = script.onreadystatechange = null;
					head.removeChild(script);
					if (Info.isInternetExplorer() && Info.internetExplorerVersion() < 9) {
						Async.eventually(function () {
							if (!hasResult)
								script.onerror();
						});
					}
				}
			};

			script.src = uri;
			head.appendChild(script);
			
			return promise;
		}
			
	};
	
	AjaxSupport.register(Module, 5);
	
	return Module;
});


Scoped.define("module:Ajax.XDomainRequestAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Ajax.RequestException",
    "module:Info",
    "base:Async",
    "base:Ids"
], function (AjaxSupport, Uri, HttpHeader, Promise, Types, RequestException, Info, Async, Ids) {
	
	var Module = {
		
		// IE Garbage Collection for XDomainRequest is broken
		__requests: {},
			
		supports: function (options) {
			if (!window.XDomainRequest)
				return false;
			if (options.forceJsonp || options.forcePostmessage)
				return false;
			if (!options.isCorsRequest)
				return false;
			if (!Info.isInternetExplorer() || Info.internetExplorerVersion() > 9)
				return false;
			// TODO: Check Data
			return true;
		},
		
		execute: function (options) {
			var uri = Uri.appendUriParams(options.uri, options.query || {});
			if (options.method === "GET")
				uri = Uri.appendUriParams(uri, options.data || {});
			var promise = Promise.create();
			
			var xdomreq = new XDomainRequest();
			Module.__requests[Ids.objectId(xdomreq)] = xdomreq;

			xdomreq.onload = function () {
		    	// TODO: Figure out response type.
		    	AjaxSupport.promiseReturnData(promise, options, xdomreq.responseText, "json"); //options.decodeType);
				delete Module.__requests[Ids.objectId(xdomreq)];
			};
			
			xdomreq.ontimeout = function () {
				AjaxSupport.promiseRequestException(promise, HttpHeader.HTTP_STATUS_GATEWAY_TIMEOUT, HttpHeader.format(HttpHeader.HTTP_STATUS_GATEWAY_TIMEOUT), null, "json"); //options.decodeType);)
				delete Module.__requests[Ids.objectId(xdomreq)];
			};
			
			xdomreq.onerror = function () {
				AjaxSupport.promiseRequestException(promise, HttpHeader.HTTP_STATUS_BAD_REQUEST, HttpHeader.format(HttpHeader.HTTP_STATUS_BAD_REQUEST), null, "json"); //options.decodeType);)
				delete Module.__requests[Ids.objectId(xdomreq)];
			};

			xdomreq.open(options.method, uri);
			
			Async.eventually(function () {
				if (options.method !== "GET" && !Types.is_empty(options.data)) {
					if (options.contentType === "json")
						xdomreq.send(JSON.stringify(options.data));
					else {
						xdomreq.send(Uri.encodeUriParams(options.data, undefined, true));
					}
				} else
					xdomreq.send();
			}, this);
			
			return promise;
		}
			
	};
	
	AjaxSupport.register(Module, 9);
	
	return Module;
});


Scoped.define("module:Ajax.XmlHttpRequestAjax", [
    "base:Ajax.Support",
    "base:Net.Uri",
    "base:Net.HttpHeader",
    "base:Promise",
    "base:Types",
    "base:Objs",
    "base:Ajax.RequestException",
    "module:Info"
], function (AjaxSupport, Uri, HttpHeader, Promise, Types, Objs, RequestException, Info) {
	
	var Module = {
		
		supports: function (options) {
			if (!window.XMLHttpRequest)
				return false;
			if (options.forceJsonp || options.forcePostmessage)
				return false;
			if (Info.isInternetExplorer() && Info.internetExplorerVersion() < 10 && options.isCorsRequest)
				return false;
			try {
				Objs.iter(options.data, function (value) {
					if ((typeof Blob !== "undefined" && value instanceof Blob) || (typeof File !== "undefined" && value instanceof File))
						options.requireFormData = true;
				});
				if (options.requireFormData)
					new FormData();
			} catch (e) {
				options.requireFormData = false;
			}
			return true;
		},
		
		execute: function (options, progress, progressCtx) {
			var uri = Uri.appendUriParams(options.uri, options.query || {});
			if (options.method === "GET")
				uri = Uri.appendUriParams(uri, options.data || {});
			var promise = Promise.create();
			
			var xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function () {
			    if (xmlhttp.readyState === 4) {
			    	if (HttpHeader.isSuccessStatus(xmlhttp.status) || xmlhttp.status === 0) {
				    	AjaxSupport.promiseReturnData(promise, options, xmlhttp.responseText, options.decodeType || "json");
			    	} else {
			    		AjaxSupport.promiseRequestException(promise, xmlhttp.status, xmlhttp.statusText, xmlhttp.responseText, options.decodeType || "json");
			    	}
			    }
			};
			
			if (progress) {				
				(xmlhttp.upload || xmlhttp).onprogress = function (e) {
					if (e.lengthComputable)
						progress.call(progressCtx || this, e.loaded, e.total);
				};
			}
			
			xmlhttp.open(options.method, uri, true);

			if (options.corscreds)
				xmlhttp.withCredentials = true;

			if (options.method !== "GET" && !Types.is_empty(options.data)) {
				if (options.requireFormData) {
					var formData = new FormData();
					Objs.iter(options.data, function (value, key) {
						formData.append(key, value);
					}, this);
					// xmlhttp.setRequestHeader("Content-Type", "multipart/form-data");
					xmlhttp.send(formData);
				} else if (options.contentType === "json") {
					if (options.sendContentType)
						xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
					xmlhttp.send(JSON.stringify(options.data));
				} else {
					if (options.sendContentType)
						xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					xmlhttp.send(Uri.encodeUriParams(options.data, undefined, true));
				}
			} else
				xmlhttp.send();
			
			return promise;
		}
			
	};
	
	AjaxSupport.register(Module, 10);
	
	return Module;
});


Scoped.define("module:Apps", [
    "base:Time",
    "base:Async",
    "base:Promise",
    "module:Info",
    "module:Loader"
], function (Time, Async, Promise, Info, Loader) {
	return {
		
		STATE_INCOMPATIBLE_DEVICE: 1,
		STATE_APP_LAUNCHED: 2,
		STATE_APP_INSTALLED_AND_LAUNCHED: 3,
		STATE_APP_NOT_INSTALLED: 4,
		STATE_UNKNOWN: 5,
				
		//ios.launch, ios.install, android.intent, android.launch, android.install
		launch: function (options) {			
			var promise = Promise.create();
			var start = Time.now();
			if (Info.isiOS() && options.ios) {
				Async.eventually(function () {
					if (Time.now() - start > 3000)
						promise.asyncSuccess(this.STATE_APP_LAUNCHED);
					else {
						start = Time.now();
						Async.eventually(function () {
							if (Time.now() - start > 3000)
								promise.asyncSuccess(this.STATE_APP_INSTALLED_AND_LAUNCHED);
							else 
								promise.asyncError(this.STATE_APP_NOT_INSTALLED);
						}, this, 2500);
						document.location = options.ios.install;
					}
				}, this, 2500);
				document.location = options.ios.launch;
			} else /*if (Info.isAndroid() && options.android) {
				if (Info.isOpera()) {
					Loader.loadByIFrame({
						url: options.android.launch
					}, function () {
						document.location
					}, this);
				} else if (Info.isFirefox()) {
				} else {
					document.location = options.android.intent;
					promise.asyncSuccess(this.STATE_UNKNOWN);
				}
			} else*/
				promise.asyncError(this.STATE_INCOMPATIBLE_DEVICE);
			return promise;
		},
		
		appStoreLink: function (appIdent) {
			return "itms://itunes.apple.com/us/app/" + appIdent + "?mt=8&uo=4";
		},
		
		playStoreLink: function (appIdent) {
			return "http://play.google.com/store/apps/details?id=<" + appIdent + ">";
		},
		
		iOSAppURL: function (protocol, url) {
			return protocol + "://" + url;
		},
		
		androidAppUrl: function (protocol, url) {
			return protocol + "://" + url;
		},
		
		googleIntent: function (protocol, url, appIdent) {
			return "intent://" + url + ";scheme=" + protocol + ";package=" + appIdent + ";end";
		}
		
	};
});


/*
function launchAndroidApp(el) {
    heartbeat = setInterval(intervalHeartbeat, 200);
    if (navigator.userAgent.match(/Opera/) || navigator.userAgent.match(/OPR/)) {
        tryIframeApproach();
    } else if (navigator.userAgent.match(/Firefox/)) {
        webkitApproach();
        iframe_timer = setTimeout(function () {
            tryIframeApproach();
        }, 1500);
    } else if (navigator.userAgent.match(/Chrome/)) {
        document.location = googleIntent; // Use google intent
    } else { // Native browser ?
        document.location = googleIntent; // Use google intent
    }
}

function webkitApproach() {
    document.location = nativeAndroidUrl;
    timer = setTimeout(function () {
        document.location = googlePlayStore;
    }, 2500);
}

function clearTimers() {
    clearTimeout(timer);
    clearTimeout(heartbeat);
    clearTimeout(iframe_timer);
}

function intervalHeartbeat() {
    if (document.webkitHidden || document.hidden) {
        clearTimers();
    }
}

function tryIframeApproach() {
    var iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.onload = function () {
        document.location = googlePlayStore;
    };
    iframe.src = nativeAndroidUrl;
    document.body.appendChild(iframe);
}

 */
Scoped.define("module:Blobs", [], function() {
	return {

		createBlobByArrayBufferView : function(arrayBuffer, offset, size, type) {
			try {
				return new Blob([ new DataView(arrayBuffer, offset, size) ], {
					type : type
				});
			} catch (e) {
				try {
					return new Blob([ new Uint8Array(arrayBuffer, offset, size) ], {
						type : type
					});
				} catch (e) {
					var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
					var bb = new BlobBuilder();
			        bb.append(arrayBuffer.slice(offset, offset + size));
			        return bb.getBlob(type);
				}
			}
		}

	};
});
Scoped.define("module:Cookies", ["base:Objs", "base:Types"], function (Objs, Types) {
	return {
		
		getCookielikeValue: function (cookies, key) {
			return decodeURIComponent(cookies.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
		},
	
		get : function(key) {
			return this.getCookielikeValue(document.cookie, key);
		},
		
		createCookielikeValue: function (key, value, end, path, domain, secure) {
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
		    return Objs.map(components, function (component) {
		    	return Types.is_array(component) ? component.join("=") : component;
		    }).join("; ");
		},
	
		set : function(key, value, end, path, domain, secure) {
			document.cookie = this.createCookielikeValue(key, value, end, path, domain, secure);
		},
		
		removeCookielikeValue: function (key, value, path, domain) {
			return this.createCookielikeValue(key, value, new Date(0), path, domain);
		},
		
		remove: function (key, value, path, domain) {
			document.cookie = this.removeCookielikeValue(key, value, path, domain);
		},
		
		hasCookielikeValue: function (cookies, key) {
			return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(cookies);
		},
		
		has: function (key) {
			return this.hasCookielikeValue(document.cookie, key);
		},
		
		keysCookielike: function (cookies) {
			var base = cookies.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
			return Objs.map(base, decodeURIComponent);
		},
		
		keys: function () {
			return this.keysCookielike(document.cookie);
		}
		
	};
});

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
				this.clear();
				inherited.destroy.call(this);
			},
			
			on: function (element, events, callback, context) {
				events.split(" ").forEach(function (event) {
					if (!event)
						return;
					var callback_function = Functions.as_method(callback, context || element);
					element.addEventListener(event, callback_function, false);
					this.__callbacks[event] = this.__callbacks[event] || [];
					this.__callbacks[event].push({
						element: element,
						callback_function: callback_function,
						callback: callback,
						context: context
					});
				}, this);
				return this;
			},
			
			off: function (element, events, callback, context) {
				events.split(" ").forEach(function (event) {
					if (!event)
						return;
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
				}, this);
				return this;
			},
			
			clear: function () {
				Objs.iter(this.__callbacks, function (entries, event) {
					entries.forEach(function (entry) {
						entry.element.removeEventListener(event, entry.callback_function, false);
					});
				});
				this.__callbacks = {};
			}
			
		};
	});	
});
/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/

Scoped.define("module:FlashDetect", ["base:Class"], function (Class, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function () {
				inherited.constructor.call(this);
				this.__version = null;
		        if (navigator.plugins && navigator.plugins.length > 0) {
		            var type = 'application/x-shockwave-flash';
		            var mimeTypes = navigator.mimeTypes;
		            if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description)
		                this.__version = this.parseVersion(mimeTypes[type].enabledPlugin.description);
		        } else if (navigator.appVersion.indexOf("Mac") == -1 && "execScript" in window) {
		            for (var i = 0; i < this.__activeXDetectRules.length; i++) {
				        try {
				            var obj = new ActiveXObject(this.__activeXDetectRules[i].name);
				            var version = this.__activeXDetectRules[i].version(obj);
		                    if (version) {
		                    	this.__version = this.parseActiveXVersion(version);
		                    	break;
		                    }
				        } catch (err) { }
				    }
				}
			},
			
		    parseVersion: function(str) {
		        var descParts = str.split(/ +/);
		        var majorMinor = descParts[2].split(/\./);
		        var revisionStr = descParts[3];
		        return {
		            "raw": str,
		            "major": parseInt(majorMinor[0], 10),
		            "minor": parseInt(majorMinor[1], 10), 
		            "revisionStr": revisionStr,
		            "revision": parseInt(revisionStr.replace(/[a-zA-Z]/g, ""), 10)
		        };
		    },
			
		    parseActiveXVersion : function(str) {
		        var versionArray = str.split(",");
		        return {
		            "raw": str,
		            "major": parseInt(versionArray[0].split(" ")[1], 10),
		            "minor": parseInt(versionArray[1], 10),
		            "revision": parseInt(versionArray[2], 10),
		            "revisionStr": versionArray[2]
		        };
		    },
			
			version: function () {
				return this.__version;
			},
			
			installed: function () {
				return this.__version !== null;
			},
			
			supported: function () {
				var ua = navigator.userAgent;
				return this.installed() || !(ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1 || ua.indexOf('iPad') != -1);
			},
			
		    majorAtLeast : function (version) {
		        return this.installed() && this.version().major >= version;
		    },
		
		    minorAtLeast : function (version) {
		        return this.installed() && this.version().minor >= version;
		    },
		
		    revisionAtLeast : function (version) {
		        return this.installed() && this.version().revision >= version;
		    },
		
		    versionAtLeast : function (major) {
		    	if (!this.installed())
		    		return false;
		        var properties = [this.version().major, this.version().minor, this.version().revision];
		        var len = Math.min(properties.length, arguments.length);
		        for (var i = 0; i < len; i++) {
		            if (properties[i] != arguments[i]) 
		            	return properties[i] > arguments[i];
		        }
		        return true;
		    },
			
		    __activeXDetectRules: [{
		        name: "ShockwaveFlash.ShockwaveFlash.7",
		        version: function(obj) {
			        try {
			            return obj.GetVariable("$version");
			        } catch(err) {
			        	return null;
			        }
			    }
			}, {
				name: "ShockwaveFlash.ShockwaveFlash.6",
		        version: function(obj) {
		            try {
		                obj.AllowScriptAccess = "always";
				        try {
				            return obj.GetVariable("$version");
				        } catch(err) {
				        	return null;
				        }
		            } catch(err) {
		            	return "6,0,21";
		            }
		        }
			}, {
				name: "ShockwaveFlash.ShockwaveFlash",
				version: function(obj) {
			        try {
			            return obj.GetVariable("$version");
			        } catch(err) {
			        	return null;
			        }
		        }
		    }]
		    
		};
	});
});


Scoped.define("module:FlashHelper", [
    "base:Time", "base:Objs", "base:Types", "base:Net.Uri", "base:Ids", "module:Info", "module:Dom"
], function (Time, Objs, Types, Uri, Ids, Info, Dom) {
	return {
		
		getFlashObject: function (container) {
			container = Dom.unbox(container);
			var embed = container.getElementsByTagName("EMBED")[0];
			if (Info.isInternetExplorer() && Info.internetExplorerVersion() <= 10)
				embed = null;
			if (!embed)
				embed = container.getElementsByTagName("OBJECT")[0];
			if (!embed) {
				var objs = document.getElementsByTagName("OBJECT");
				for (var i = 0; i < objs.length; ++i)
					if (container.contains(objs[i]))
						embed = objs[i];
			}
			return embed;
		},
		
		embedTemplate: function (options) {
			options = options || {};
			var params = [];
			params.push({
				"objectKey": "classid",
				"value": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
			});
			params.push({
				"objectKey": "codebase",
				"value": "http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab"
			});
			params.push({
				"embedKey": "align",
				"value": "middle"
			});
			params.push({
				"embedKey": "play",
				"value": "true"
			});
			params.push({
				"embedKey": "loop",
				"value": "false"
			});
			params.push({
				"embedKey": "type",
				"value": "application/x-shockwave-flash"
			});
			params.push({
				"embedKey": "pluginspage",
				"value": "http://www.adobe.com/go/getflashplayer"
			});
			params.push({
				"objectParam": "quality",
				"embedKey": "quality",
				"value": "high"
			});
			params.push({
				"objectParam": "allowScriptAccess",
				"embedKey": "allowScriptAccess",
				"value": "always"
			});
			params.push({
				"objectParam": "wmode",
				"embedKey": "wmode",
				"value": "opaque"
			});
			params.push({
				"objectParam": "movie",
				"embedKey": "src",
				"value": options.flashFile + (options.forceReload ? "?" + Time.now() : "") 
			});
			if (options.width) {
				params.push({
					"objectKey": "width",
					"embedKey": "width",
					"value": options.width
				});
			}
			if (options.height) {
				params.push({
					"objectKey": "height",
					"embedKey": "height",
					"value": options.height
				});
			}
			if (options.bgcolor) {
				params.push({
					"objectParam": "bgcolor",
					"embedKey": "bgcolor",
					"value": options.bgcolor
				});
			}
			if (options.FlashVars) {
				params.push({
					"objectParam": "FlashVars",
					"embedKey": "FlashVars",
					"value": Types.is_object(options.FlashVars) ? Uri.encodeUriParams(options.FlashVars) : options.FlashVars
				});
			}
			params.push({
				"objectKey": "id",
				"value": options.objectId || Ids.uniqueId("flash")
			});
			var objectKeys = [];
			var objectParams = [];
			var embedKeys = [];
			Objs.iter(params, function (param) {
				if (param.objectKey)
					objectKeys.push(param.objectKey + '="' + param.value + '"');
				if (param.embedKey)
					embedKeys.push(param.embedKey + '="' + param.value + '"');
				if (param.objectParam)
					objectParams.push('<param name="' + param.objectParam + '" value="' + param.value + '" />');
			}, this);
			return "<object " + objectKeys.join(" ") + ">" + objectParams.join(" ") + "<embed " + embedKeys.join(" ") + "></embed></object>";
		},
		
		embedFlashObject: function (container, options) {
			container = Dom.unbox(container);
			options = options || {};
			if (options.parentBgcolor) {
				try {
					var hex = container.style.backgroundColor || "";
					if (hex.indexOf("rgb") >= 0) {
						var rgb = hex.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
					    var convert = function (x) {
					        return ("0" + parseInt(x, 10).toString(16)).slice(-2);
					    };
					    if (rgb && rgb.length > 3)
					    	hex = "#" + convert(rgb[1]) + convert(rgb[2]) + convert(rgb[3]);
					}
					options.bgcolor = hex;
				} catch (e) {}
			}
			if (options.fixHalfPixels) {
				try {
					var offset = Dom.elementOffset(container);
					if (offset.top % 1 !== 0)
						container.style.marginTop = (Math.round(offset.top) - offset.top) + "px";
					if (offset.left % 1 !== 0)
						container.style.marginLeft = (Math.round(offset.left) - offset.left) + "px";
				} catch (e) {}
			}
			container.innerHTML = this.embedTemplate(options);
			return this.getFlashObject(container);
		}
		
	};	
});

/*
 * Uses modified portions of:
 * 
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */

Scoped.define("module:Hotkeys", [
	"base:Objs"
], function (Objs) {
	return {		
		
		SHIFT_NUMS: {
			"`":"~",
			"1":"!",
			"2":"@",
			"3":"#",
			"4":"$",
			"5":"%",
			"6":"^",
			"7":"&",
			"8":"*",
			"9":"(",
			"0":")",
			"-":"_",
			"=":"+",
			";":":",
			"'":"\"",
			",":"<",
			".":">",
			"/":"?",
			"\\":"|"
		},
		
		SPECIAL_KEYS: {
			'esc':27,
			'escape':27,
			'tab':9,
			'space':32,
			'return':13,
			'enter':13,
			'backspace':8,
	
			'scrolllock':145,
			'scroll_lock':145,
			'scroll':145,
			'capslock':20,
			'caps_lock':20,
			'caps':20,
			'numlock':144,
			'num_lock':144,
			'num':144,
			
			'pause':19,
			'break':19,
			
			'insert':45,
			'home':36,
			'delete':46,
			'end':35,
			
			'pageup':33,
			'page_up':33,
			'pu':33,
	
			'pagedown':34,
			'page_down':34,
			'pd':34,
	
			'left':37,
			'up':38,
			'right':39,
			'down':40,
	
			'f1':112,
			'f2':113,
			'f3':114,
			'f4':115,
			'f5':116,
			'f6':117,
			'f7':118,
			'f8':119,
			'f9':120,
			'f10':121,
			'f11':122,
			'f12':123
		},
		
		MODIFIERS: ["ctrl", "alt", "shift", "meta"],
		
		keyCodeToCharacter: function (code) {
			if (code == 188)
				return ",";
			else if (code == 190)
				return ".";
			return String.fromCharCode(code).toLowerCase();
		},
		
		register: function (hotkey, callback, context, options) {
			var self = this;
			options = Objs.extend({
				"type": "keyup",
				"propagate": false,
				"disable_in_input": false,
				"target": document,
				"keycode": false
			}, options);
			var keys = hotkey.toLowerCase().split("+");
			var func = function (e) {
				if (options.disable_in_input) {
					var element = e.target || e.srcElement || null;
					if (element && element.nodeType == 3)
						element = element.parentNode;
					if (element && (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA'))
						return;
				}
				var code = e.keyCode || e.which || 0;
				var character = self.keyCodeToCharacter(code);
				var kp = 0;
				var modifier_map = {};
				Objs.iter(self.MODIFIERS, function (mod) {
					modifier_map[mod] = {
						pressed: e[mod + "Key"],
						wanted: false
					};
				}, this);
				Objs.iter(keys, function (key) {
					if (key in modifier_map) {
						modifier_map[key].wanted = true;
						kp++;
					} else if (key.length > 1) {
						if (self.SPECIAL_KEYS[key] == code)
							kp++;
					} else if (options.keycode) {
						if (options.keycode == code)
							kp++;
					} else if (character == key || (e.shiftKey && self.SHIFT_NUMS[character] == key)) {
						kp++;
					}
				}, this);
				if (kp == keys.length && Objs.all(modifier_map, function (data) { return data.wanted == data.pressed; })) {
					callback.apply(context || this);
					if (!options.propagate)
						e.preventDefault();
				}
			};
			options.target.addEventListener(options.type, func, false);
			return {
				target: options.target,
				type: options.type,
				func: func
			};
		},
		
		unregister: function (handle) {
			handle.target.removeEventListener(handle.type, handle.func, false);
		} 
		
	};
});
Scoped.define("module:Info", [
        "base:Objs", "module:FlashDetect"
    ], function (Objs, FlashDetect) {
	return {
		
		__navigator: null,
		
		getNavigator: function () {
			if (!this.__navigator) {
				this.__navigator = {
					appCodeName: navigator.appCodeName,
					appName: navigator.appName,
					appVersion: navigator.appVersion,
					cookieEnabled: navigator.cookieEnabled,
					onLine: navigator.onLine,
					platform: navigator.platform,
					userAgent: navigator.userAgent,
					window_chrome: "chrome" in window,
					window_opera: "opera" in window,
					language: navigator.language || navigator.userLanguage || ""
				};
			}
			return this.__navigator;
		},
		
		__cache: {},
		
		__cached: function (key, value_func, force) {
			if (!(key in this.__cache) || force) {
				var n = this.getNavigator();
				this.__cache[key] = value_func.call(this, n, n.userAgent, n.userAgent.toLowerCase());
			}
			return this.__cache[key];
		},
		
		setNavigator: function (obj) {
			this.__navigator = obj;
			this.__cache = {};
		},
		
		language: function () {
			return this.__cached("language", function (nav) {
				return nav.language;
			});
		},
	
		flash: function (force) {
			return this.__cached("flash", function () {
				return new FlashDetect();
			}, force);
		},
		
		isiOS: function () {
			return this.__cached("isiOS", function (nav, ua) {
				if (this.isInternetExplorer() || this.isIEMobile())
					return false;
				return ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1 || ua.indexOf('iPad') != -1;
			});
		},
		
		isEdge: function () {
			return this.__cached("isEdge", function (nav, ua) {
				return ua.indexOf('Edge') != -1;
			});
		},
		
		isCordova: function () {
			return this.__cached("isCordova", function () {
				return !!window.cordova || !!window._cordovaNative || document.location.href.indexOf("file:///android_asset/www") === 0 || document.location.href.indexOf("file:///var/mobile/Containers/Bundle/Application") === 0;
			});
		},
		
		isLocalCordova: function () {
			return this.__cached("isLocalCordova", function () {
				return this.isCordova() && document.location.href.indexOf("http") !== 0;
			});
		},

		isChrome: function () {
			return this.__cached("isChrome", function (nav, ua) {
				return (nav.window_chrome || ua.indexOf('CriOS') != -1) && !this.isOpera() && !this.isEdge();
			});
		},
		
		isChromium: function () {
			return this.__cached("isChromium", function (nav, ua, ualc) {
				return !this.isChrome() && this.isAndroid() && ualc.indexOf("linux") >= 0;
			});
		},
		
		isChromiumBased: function () {
			return this.__cached("isChromiumBased", function () {
				return this.isChrome() || this.isChromium();
			});
		},
		
		isOpera: function () {
			return this.__cached("isOpera", function (nav, ua) {
				return nav.window_opera || ua.indexOf(' OPR/') >= 0 || ua.indexOf("OPiOS") >= 0 || ua.indexOf('Opera') >= 0;
			});
		},
		
		isAndroid: function () {
			return this.__cached("isAndroid", function (nav, ua, ualc) {
				return ualc.indexOf("android") != -1;
			});
		},
		
		isWebOS: function () {
			return this.__cached("isWebOS", function (nav, ua, ualc) {
				return ualc.indexOf("webos") != -1;
			});
		},
	
		isWindowsPhone: function () {
			return this.__cached("isWindowsPhone", function (nav, ua, ualc) {
				return ualc.indexOf("windows phone") != -1;
			});
		},
	
		isBlackberry: function () {
			return this.__cached("isBlackberry", function (nav, ua, ualc) {
				return ualc.indexOf("blackberry") != -1;
			});
		},
	
		iOSversion: function () {
			return this.__cached("iOSversion", function (nav) {
				if (!this.isiOS())
					return false;
			    var v = (nav.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
			    return {
			    	major: parseInt(v[1], 10),
			    	minor: parseInt(v[2], 10),
			    	revision: parseInt(v[3] || 0, 10)
			    };
			});
		},
		
		androidVersion: function () {
			return this.__cached("androidVersion", function (nav) {
				if (!this.isAndroid())
					return false;
			    var v = (nav.userAgent).match(/Android (\d+)\.(\d+)\.?(\d+)?/);
			    return {
			    	major: parseInt(v[1], 10),
			    	minor: parseInt(v[2], 10),
			    	revision: parseInt(v[3] || 0, 10)
			    };
			});
		},

		isMobile: function () {
			return this.__cached("isMobile", function () {
				return this.isiOS() || this.isAndroid() || this.isWebOS() || this.isWindowsPhone() || this.isBlackberry();
			});
		},
		
		isDesktop: function () {
			return this.__cached("isDesktop", function () {
				return !this.isMobile();
			});
		},
		
		isInternetExplorer: function () {
			return this.__cached("isInternetExplorer", function () {
				//return navigator.appName == 'Microsoft Internet Explorer';
				return !this.isIEMobile() && this.internetExplorerVersion() !== null;
			});
		},
		
		isIEMobile: function () {
			return this.__cached("isIEMobile", function (nav, ua, ualc) {
				return ualc.indexOf("iemobile") >= 0;
			});
		},

		isFirefox: function () {
			return this.__cached("isFirefox", function (nav, ua, ualc) {
				return ualc.indexOf("firefox") != -1 || ualc.indexOf("fxios") != -1;
			});
		},
		
		isSafari: function () {
			return this.__cached("isSafari", function (nav, ua, ualc) {
				return !this.isChrome() && !this.isOpera() && !this.isEdge() && !this.isFirefox() && ualc.indexOf("safari") != -1 && !this.isAndroid();
			});
		},
		
		isWindows: function () {
			return this.__cached("isWindows", function (nav) {
				return nav.appVersion.toLowerCase().indexOf("win") != -1 && !this.isWindowsPhone();
			});
		},
		
		isMacOS: function () {
			return this.__cached("isMacOS", function (nav) {
				return !this.isiOS() && nav.appVersion.toLowerCase().indexOf("mac") != -1;
			});
		},
		
		isUnix: function () {
			return this.__cached("isUnix", function (nav) {
				return nav.appVersion.toLowerCase().indexOf("x11") != -1;
			});
		},
		
		isLinux: function () {
			return this.__cached("isLinux", function (nav) {
				return !this.isAndroid() && nav.appVersion.toLowerCase().indexOf("linux") != -1;
			});
		},
		
		internetExplorerVersion: function () {
			return this.__cached("internetExplorerVersion", function (nav, ua) {
				if (nav.appName == 'Microsoft Internet Explorer') {
				    var re = new RegExp("MSIE ([0-9]+)");
				    var ma = re.exec(ua);
				    if (ma)
				    	return ma[1];
				} else if (nav.appName == 'Netscape') {
				    var re2 = new RegExp("Trident/.*rv:([0-9]+)");
				    var ma2 = re2.exec(nav.userAgent); 
				    if (ma2)
				    	return parseFloat(ma2[1]);
				}
				return null;
			});
		},
		
		chromeVersion: function () {
			return this.__cached("chromeVersion", function (nav, ua) {
				var re = /Chrome\/(\d+\.\d+)[^\d]/gi;
				var ma = re.exec(ua);
				if (ma)
					return parseFloat(ma[1]);
				return null;
			});
		},
		
		operaVersion: function () {
			return this.__cached("operaVersion", function (nav, ua) {
				var re = /OPR\/(\d+\.\d+)[^\d]/gi;
				var ma = re.exec(ua);
				if (ma)
					return parseFloat(ma[1]);
				return null;
			});
		},
		
		safariVersion: function () {
			return this.__cached("safariVersion", function (nav, ua) {
				var re = /Version\/(\d+\.\d+)[^\d]/gi;
				var ma = re.exec(ua);
				if (ma)
					return parseFloat(ma[1]);
				return null;
			});
		},

		firefoxVersion: function () {
			return this.__cached("firefoxVersion", function (nav, ua) {
				var re = /Firefox\/(\d+\.\d+)/gi;
				var ma = re.exec(ua);
				if (ma)
					return parseFloat(ma[1]);
				return null;
			});
		},

		inIframe: function () {
		    try {
		        return window.self !== window.top;
		    } catch (e) {
		        return true;
		    }
		},
		
		__devicesMap: {
		    mobile: {
		    	format: "Mobile",
		    	check: function () { return this.isMobile(); }
		    }, desktop: {
		    	format: "Desktop",
		    	check: function () { return this.isDesktop(); }
		    }
		},
		
		__obtainMatch: function (map, def) {
			var result = null;
			Objs.iter(map, function (value, key) {
				if (value.check.apply(this)) {
					if (result) {
						result = null;
						return false;
					}
					result = Objs.clone(value, 1);
					delete result.check;
					result.key = key;
				}
			}, this);
			return result || def;
		},
		
		getDevice: function () {
			return this.__cached("getDevice", function () {
				return this.__obtainMatch(this.__devicesMap, {
					key: "unknown",
					format: "Unknown Device"
				});
			});
		},
		
		formatDevice: function () {
			return this.getDevice().format;
		},
		
		__osMap: {
		    macosx: {
		    	format: "Mac OS-X",
		    	check: function () { return this.isMacOS(); }
		    }, windows: {
		    	format: "Windows",
		    	check: function () { return this.isWindows(); }
		    }, unix: {
		    	format: "Unix",
		    	check: function () { return this.isUnix(); }
		    }, linux: {
		    	format: "Linux",
		    	check: function () { return this.isLinux(); }
		    }, ios: {
		    	format: "iOS",
		    	check: function () { return this.isiOS(); },
		    	version: function () {
		    		return this.iOSversion().major + "." + this.iOSversion().minor + "." + this.iOSversion().revision;
		    	}
		    }, android: {
		    	format: "Android",
		    	check: function () { return this.isAndroid(); }
		    }, webos: {
		    	format: "WebOS",
		    	check: function () { return this.isWebOS(); }
		    }, windowsphone: {
		    	format: "Windows Phone",
		    	check: function () { return this.isWindowsPhone(); }
		    }, blackberry: {
		    	format: "Blackberry",
		    	check: function () { return this.isBlackberry(); }
		    }
		},
		
		getOS: function () {
			return this.__cached("getOS", function () {
				return this.__obtainMatch(this.__osMap, {
					key: "unknown",
					format: "Unknown Operating System"
				});
			});
		},
		
		formatOS: function () {
			return this.getOS().format;
		},
		
		formatOSVersion: function () {
			return this.getOS().version ? this.getOS().version.apply(this) : ""; 
		},
			
		__browserMap: {
		    chrome: {
		    	format: "Chrome",
		    	check: function () { return this.isChrome(); },
		    	version: function () {
		    		return this.chromeVersion();
		    	}
		    }, chromium: {
		    	format: "Chromium",
		    	check: function () { return this.isChromium(); }
		    }, opera: {
		    	format: "Opera",
		    	check: function () { return this.isOpera(); },
		    	version: function () {
		    		return this.operaVersion();
		    	}
		    }, internetexplorer: {
		    	format: "Internet Explorer",
		    	check: function () { return this.isInternetExplorer(); },
		    	version: function () {
		    		return this.internetExplorerVersion();
		    	}
		    }, firefox: {
		    	format: "Firefox",
		    	check: function () { return this.isFirefox(); },
		    	version: function () {
		    		return this.firefoxVersion();
		    	}
		    }, safari: {
		    	format: "Safari",
		    	check: function () { return this.isSafari(); },
		    	version: function () {
		    		return this.safariVersion();
		    	}
		    }, webos: {
		    	format: "WebOS",
		    	check: function () { return this.isWebOS(); }
		    }, blackberry: {
		    	format: "Blackberry",
		    	check: function () { return this.isBlackberry(); }
		    }, edge: {
		    	format: "Edge",
		    	check: function () { return this.isEdge(); }
		    }, iemobile: {
		    	format: "IE Mobile",
		    	check: function () { return this.isIEMobile(); }
		    }		    
		},
		
		getBrowser: function () {
			return this.__cached("getBrowser", function () {
				return this.__obtainMatch(this.__browserMap, {
					key: "unknown",
					format: "Unknown Browser"
				});
			});
		},
		
		formatBrowser: function () {
			return this.getBrowser().format;
		},
		
		formatBrowserVersion: function () {
			return this.getBrowser().version ? this.getBrowser().version.apply(this) : ""; 
		},

		formatFlash: function () {
			return this.flash().installed() ?
				("Flash " + this.flash().version().raw) :
				(this.flash().supported() ?
					"Flash not installed but supported" :
					"Flash not supported");
		}
		
	};
});	

Scoped.define("module:Loader", [
    "base:Ajax.Support",
    "module:Info"
], function (AjaxSupport, Info) {
	return {				
		
		loadScript: function (url, callback, context) {
			var executed = false;
			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");
			script.src = url;
			script.onload = script.onreadystatechange = function() {
				if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					executed = true;
					script.onload = script.onreadystatechange = null;
					if (callback)
						callback.call(context || this, url);
					// Does not work properly if we remove the script for some reason if it is used the second time !?
					//head.removeChild(script);
				}
			};
			head.appendChild(script);
		},
		
		loadStyles: function (url, callback, context) {
			var executed = false;
			var head = document.getElementsByTagName("head")[0];
			var style = document.createElement("link");
			style.rel = "stylesheet";
			style.href = url;
			style.onload = style.onreadystatechange = function() {
				if (!executed && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					executed = true;
					style.onload = style.onreadystatechange = null;
					if (callback)
						callback.call(context || this, url);
				}
			};
			head.appendChild(style);
		},
	
		inlineStyles: function (styles) {
			var head = document.getElementsByTagName("head")[0];
			var style = document.createElement("style");
			if (Info.isInternetExplorer() && Info.internetExplorerVersion() < 9) {
				style.setAttribute('type', 'text/css');
				style.styleSheet.cssText = styles;
			} else
				style.textContent = styles;
			head.appendChild(style);
			return style;
		},
		
		loadHtml: function (uri, callback, context) {
			AjaxSupport.execute({
				uri: uri,
				decodeType: "html"
			}).success(function (content) {
				callback.call(this, content, uri);
			}, context);
		},
		
		findScript: function (substr) {
			for (var i = 0; i < document.scripts.length; ++i)
				if (document.scripts[i].src.toLowerCase().indexOf(substr.toLowerCase()) >= 0)
					return document.scripts[i];
			return null;
		},
		
		loadByIframe: function (options, callback, context) {
		    var iframe = document.createElement("iframe");
		    if (options.visible) {
			    iframe.style.border = "none";
			    iframe.style.width = "1px";
			    iframe.style.height = "1px";
		    } else {
		    	iframe.style.display = "none";
		    }
		    var loaded = function () {
		    	var body = null;
		    	var content = null;
		    	try {
		    		body = iframe.contentDocument.body;
		    		content = body.textContent || body.innerText;
		    	} catch (e) {}
		        callback.call(context || this, content, body, iframe);
		        if (options.remove)
		        	document.body.removeChild(iframe);
		    };
		    if (iframe.attachEvent)
		    	iframe.attachEvent("onload", loaded);
		    else
		    	iframe.onload = loaded;
		    iframe.src = options.url;
		    document.body.appendChild(iframe);
		}

	};
});
Scoped.define("module:HashRouteBinder", [
    "base:Router.RouteBinder",
    "module:Events"
], function (RouteBinder, Events, scoped) {
	return RouteBinder.extend({scoped: scoped}, function (inherited) {
		return {

			constructor: function (router) {
				inherited.constructor.call(this, router);
				var events = this.auto_destroy(new Events());
				events.on(window, "hashchange", function () {
					this._localRouteChanged();
				}, this);
			},
			
			_getLocalRoute: function () {
				var hash = window.location.hash;
				return (hash.length && hash[0] == '#') ? hash.slice(1) : hash;
			},
			
			_setLocalRoute: function (currentRoute) {
				window.location.hash = "#" + currentRoute.route;
			}
			
		};
	});
});


Scoped.define("module:HistoryRouteBinder", [
    "base:Router.RouteBinder",
    "module:Events"
], function (RouteBinder, Events, scoped) {
	return RouteBinder.extend({scoped: scoped}, function (inherited) {
		return {

			__used: false,
			
			constructor: function (router) {
				inherited.constructor.call(this, router);
				var events = this.auto_destroy(new Events());
				events.on(window, "hashchange", function () {
					if (this.__used)
						this._localRouteChanged();
				}, this);
			},
			
			_getLocalRoute: function () {
				return window.location.pathname;
			},
			
			_setLocalRoute: function (currentRoute) {
				window.history.pushState({}, document.title, currentRoute.route);
				this.__used = true;
			}
			
		};
	}, {
		supported: function () {
			return window.history && window.history.pushState;
		}
	});
});


Scoped.define("module:LocationRouteBinder", [
    "base:Router.RouteBinder"
], function (RouteBinder, scoped) {
	return RouteBinder.extend({scoped: scoped}, {
		
		_getLocalRoute: function () {
			return window.location.pathname;
		},
		
		_setLocalRoute: function (currentRoute) {
			window.location.pathname = currentRoute.route;
		}
		
	});
});

Scoped.define("module:Dom", [
    "base:Types",
    "module:Info"
], function (Types, Info) {
	return {
		
		elementsByTemplate: function (template) {
			template = template.trim();
			var polyfill = Info.isInternetExplorer() && Info.internetExplorerVersion() < 9;
			var parentTag = 'div';
			/*
			 * TODO: This is probably not a good fix.
			 * 
			 * Some tags, like tr, are not generated by the browser when under a generic tag like div.
			 * In other words
			 * 
			 * <div>.innerHTML = "<tr><p>foo</p></tr>" will become <div><p>foo</p></div>
			 * 
			 * The quick fix here checks for an outer tag and picks the proper temporary parent tag.
			 * 
			 * This needs to be fixed properly in the future.
			 */
			if (template.indexOf("<tr") === 0)
				parentTag = "tbody";
			var element = document.createElement(parentTag);
			element.innerHTML = polyfill ? "<br/>" + template : template;
			var result = [];
			for (var i = polyfill ? 1 : 0; i < element.children.length; ++i)
				result.push(element.children[i]);
			return result;
		},

		elementByTemplate: function (template) {
			var result = this.elementsByTemplate(template);
			return result.length > 0 ? result[0] : null; 
		},
		
		changeTag: function (node, name) {
			var replacement = document.createElement(name);
			for (var i = 0; i < node.attributes.length; ++i) {
				var attr = node.attributes[i];
				replacement.setAttribute(attr.nodeName, "value" in attr ? attr.value : attr.nodeValue);
			}
		    while (node.firstChild)
		        replacement.appendChild(node.firstChild);
		    if (node.parentNode)
		    	node.parentNode.replaceChild(replacement, node);
			return replacement;
		},		
		
		traverseNext: function (node, skip_children) {
			node = this.unbox(node);
			if (node.firstChild && !skip_children)
				return node.firstChild;
			if (!node.parentNode)
				return null;
			if (node.nextSibling)
				return node.nextSibling;
			return this.traverseNext(node.parentNode, true);
		},
				
		splitNode: function (node, start_offset, end_offset) {
			start_offset = start_offset || 0;
			end_offset = end_offset || (node.wholeText ? node.wholeText.length : 0);
			if (end_offset < (node.wholeText ? node.wholeText.length : 0))
				node.splitText(end_offset);
			if (start_offset > 0) 
				node = node.splitText(start_offset);
			return node;
		},
		
		__FULLSCREEN_EVENTS: ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"],
		__FULLSCREEN_METHODS: ["requestFullscreen", "webkitRequestFullscreen", "mozRequestFullScreen", "msRequestFullscreen"],
		__FULLSCREEN_ATTRS: ["fullscreenElement", "webkitFullscreenElement", "mozFullScreenElement", "msFullscreenElement"],
		
		elementSupportsFullscreen: function (element) {
			return this.__FULLSCREEN_METHODS.some(function (key) {
				return key in element;
			});
		},
		
		elementEnterFullscreen: function (element) {
			var done = false;
			this.__FULLSCREEN_METHODS.forEach(function (key) {
				if (!done && (key in element)) {
					element[key].call(element);
					done = true;
				}
			});
		},
		
		elementIsFullscreen: function (element) {
			return this.__FULLSCREEN_ATTRS.some(function (key) {
				return document[key] === element;
			});
		},
		
		elementOnFullscreenChange: function (element, callback, context) {
			var self = this;
			var listener = function () {
				callback.call(context || this, element, self.elementIsFullscreen(element));
			};
			this.__FULLSCREEN_EVENTS.forEach(function (event) {
				element.addEventListener(event, listener, false);
			});
			return listener;
		},
		
		elementOffFullscreenChange: function (element, listener) {
			this.__FULLSCREEN_EVENTS.forEach(function (event) {
				element.removeEventListener(event, listener, false);
			});
		},

		entitiesToUnicode: function (s) {
			if (!s || !Types.is_string(s) || s.indexOf("&") < 0)
				return s;
			var temp = document.createElement("span");
			temp.innerHTML = s;
			s = temp.textContent || temp.innerText;
			if (temp.remove)
				temp.remove();
			return s;
		},
		
		unbox: function (element) {
			return !element || element.nodeType ? element : element.get(0);
		},
		
		triggerDomEvent: function (element, eventName) {
			element = this.unbox(element);
			eventName = eventName.toLowerCase();
			var onEvent = "on" + eventName;
			var onEventHandler = null;
			var onEventCalled = false;
			if (element[onEvent]) {
				onEventHandler = element[onEvent];
				element[onEvent] = function () {
					if (onEventCalled)
						return;
					onEventCalled = true;
					onEventHandler.apply(this, arguments);
				};
			}
			try {
				var event;
				try {
					event = new Event(eventName);
				} catch (e) {
					try {
						event = document.createEvent('Event');
						event.initEvent(eventName, false, false);
					} catch (e) {
						event = document.createEventObject();
						event.type = eventName;
					}
				}
				element.dispatchEvent(event);
				if (onEventHandler) {
					if (!onEventCalled)
						onEventHandler.call(element, event);
					element[onEvent] = onEventHandler;
				}
			} catch (e) {
				if (onEventHandler)
					element[onEvent] = onEventHandler;
				throw e;
			}
		},
		
		elementOffset: function (element) {
			element = this.unbox(element);
			var top = 0;
			var left = 0;
			if (element.getBoundingClientRect) {
				var box = element.getBoundingClientRect();
				top = box.top;
				left = box.left;
			}
			docElem = document.documentElement;
			return {
				top: top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
				left: left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
			};
		},
		
		elementDimensions: function (element) {
			element = this.unbox(element);
			var cs, w, h;
			if (element && window.getComputedStyle) {
				cs = window.getComputedStyle(element);
				if (cs) {
					w = parseInt(cs.width, 10);
					h = parseInt(cs.height, 10);
					if (w && h) {
						return {
							width: w,
							height: h
						};
					}
				}
			}
			if (element && element.currentStyle) {
				cs = element.currentStyle;
				w = element.clientWidth - parseInt(cs.paddingLeft || 0, 10) - parseInt(cs.paddingRight || 0, 10);
				h = element.clientHeight - parseInt(cs.paddingTop || 0, 10) - parseInt(cs.paddingTop || 0, 10);
				if (w && h) {
					return {
						width: w,
						height: h
					};
				}
			}
			if (element && element.getBoundingClientRect) {
				var box = element.getBoundingClientRect();
				h = box.bottom - box.top;
				w = box.right - box.left;
				return {
					width: w,
					height: h
				};
			}
			return {
				width: 0,
				height: 0
			};
		},
		
		childContainingElement: function (parent, element) {
			parent = this.unbox(parent);
			element = this.unbox(element);
			while (element.parentNode != parent) {
				if (element == document.body)
					return null;
				element = element.parentNode;
			}
			return element;
		},
		
		elementBoundingBox : function(element) {
			var offset = this.elementOffset(element);
			var dimensions = this.elementDimensions(element);
			return {
				left : offset.left,
				top : offset.top,
				right : offset.left + dimensions.width - 1,
				bottom : offset.top + dimensions.height - 1
			};
		},
		
		pointWithinElement : function(x, y, element) {
			var bb = this.elementBoundingBox(element);
			return bb.left <= x && x <= bb.right && bb.top <= y && y <= bb.bottom;
		},
		
		elementFromPoint : function(x, y, disregarding) {
			disregarding = disregarding || [];
			if (!Types.is_array(disregarding))
				disregarding = [ disregarding ];
			var backup = [];
			for (var i = 0; i < disregarding.length; ++i) {
				disregarding[i] = this.unbox(disregarding[i]);
				backup.push(disregarding[i].style.zIndex);
				disregarding[i].style.zIndex = -1;
			}
			var element = document.elementFromPoint(x - window.pageXOffset, y - window.pageYOffset);
			for (i = 0; i < disregarding.length; ++i)
				disregarding[i].style.zIndex = backup[i];
			return element;
		},
		
		elementAddClass: function (element, cls) {
			if (!this.elementHasClass(element, cls))
				element.className = element.className + " " + cls;
		},
		
		elementHasClass: function (element, cls) {
			return element.className.split(" ").some(function (name) {
				return name === cls;
			});
		},
		
		elementRemoveClass: function (element, cls) {
			element.className = element.className.split(" ").filter(function (name) {
				return name !== cls;
			}).join(" ");
		},
		
		elementInsertBefore: function (element, before) {
			before.parentNode.insertBefore(element, before);
		},
		
		elementInsertAfter: function (element, after) {
			if (after.nextSibling)
				after.parentNode.insertBefore(element, after.nextSibling);
			else
				after.parentNode.appendChild(element);
		},
		
		elementInsertAt: function (element, parent, index) {
			if (index >= parent.children.length)
				parent.appendChild(element);
			else
				parent.insertBefore(element, parent.children[Math.max(0, index)]);
		},
		
		elementIndex: function (element) {
			var idx = 0;
			while (element.previousElementSibling) {
				idx++;
				element = element.previousElementSibling;
			}
			return idx;
		},
		
		elementPrependChild: function (parent, child) {
			if (parent.children.length > 0)
				parent.insertBefore(child, parent.firstChild);
			else
				parent.appendChild(child);
		}

	};
});
Scoped.define("module:DomExtend.DomExtension", [
    "base:Class",
    "base:Objs",
    "base:Functions",
    "base:Async",
    "module:Dom",
    "module:DomMutation.NodeRemoveObserver",
    "module:DomMutation.NodeResizeObserver"
], function (Class, Objs, Functions, Async, Dom, NodeRemoveObserver, NodeResizeObserver, scoped) {
	return Class.extend({scoped: scoped}, function (inherited) {
		return {
			
			_domMethods: [],
			_domAttrs: {},
			
			constructor: function (element, attrs) {
				inherited.constructor.call(this);
				this._element = Dom.unbox(element);
				this._element.domExtension = this;
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
					this._nodeRemoveObserver = this.auto_destroy(new NodeRemoveObserver(this._element));
					this._nodeRemoveObserver.on("node-removed", this.weakDestroy, this);
					this._nodeResizeObserver = this.auto_destroy(new NodeResizeObserver(this._element));
					this._nodeResizeObserver.on("node-resized", function () {
						this.recomputeBB();
						this._notify("resized");
					}, this);
				}, this);
				if (!this._element.style.display || this._element.style.display == "inline")
					this._element.style.display = "inline-block";
			},
			
			domEvent: function (eventName) {
				Dom.triggerDomEvent(this._element, eventName);
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
				var width = Dom.elementDimensions(this._element).width;
				//var height = Dom.elementDimensions(this._element).height;
				if (width < idealBB.width && !this._element.style.width) {
					this._element.style.width = idealBB.width + "px";
					width = Dom.elementDimensions(this._element).width;
					var current = this._element;
					while (current != document.body) {
						current = current.parentNode;
						width = Math.min(width, Dom.elementDimensions(current).width);
					}
					this._element.style.width = null;
				}
				/*
				if (height < idealBB.height && !this._element.style.height) {
					this._element.style.height = idealBB.height + "px";
					height = Dom.elementDimensions(this._element).height;
					var current = this._element;
					while (current != document) {
						current = current.parentNode;
						height = Math.min(height, Dom.elementDimensions(current).height);
					}
					this._element.style.height = null;
				}
				var arWidth = Math.round(height * idealBB.width / idealBB.height);
				var arHeight = Math.round(width * idealBB.height / idealBB.width);
				return {
					width: Math.min(width, arWidth),
					height: Math.min(height, arHeight)
				};
				*/
				return {
					width: width,
					height: width * idealBB.height / idealBB.width
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
				this._observer = new window.MutationObserver(function (mutations) {
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
	"module:Info",
	"module:Events"
], function (Observer, Info, Events, scoped) {
	return Observer.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (node) {
				inherited.constructor.call(this, node);
				var events = this.auto_destroy(new Events());
				events.on(document, "DOMNodeRemoved", function (event) {
					this._nodeRemoved(event.target);
				}, this);
			}
			
		};
	}, {
		
		supported: function (node) {
			return !Info.isInternetExplorer() || Info.internetExplorerVersion() >= 9;
		}
		
	});	

});



Scoped.define("module:DomMutation.TimerNodeRemoveObserver", [
  	"module:DomMutation.NodeRemoveObserver",
  	"base:Timers.Timer"
], function (Observer, Timer, scoped) {
	return Observer.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (node) {
				inherited.constructor.call(this, node);
				this._timer = new Timer({
					context: this,
					fire: this._fire,
					delay: 100
				});
			},
			
			destroy: function () {
				this._timer.weakDestroy();
				inherited.destroy.call(this);
			},
			
			_fire: function () {
				if (!this._node.parentElement) {
					this._timer.stop();
					this._nodeRemoved(this._node);
				}
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
    "module:DomMutation.DOMNodeRemovedNodeRemoveObserver",
    "module:DomMutation.TimerNodeRemoveObserver"
], function (Observer, MutationObserverNodeRemoveObserver, DOMNodeRemovedNodeRemoveObserver, TimerNodeRemoveObserver) {
	Observer.register(MutationObserverNodeRemoveObserver, 3);
	Observer.register(DOMNodeRemovedNodeRemoveObserver, 2);
	Observer.register(TimerNodeRemoveObserver, 1);
	return {};
});


Scoped.define("module:DomMutation.NodeResizeObserver", [
    "base:Class",
    "base:Events.EventsMixin",
    "module:Events"
], function (Class, EventsMixin, Events, scoped) {
	return Class.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
			
			constructor: function (node) {
				inherited.constructor.call(this);
				var events = this.auto_destroy(new Events());
				events.on(window, "resize", function (event) {
					this._resized();
				}, this);
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
			
			_nodeInserted: function (node, expand) {
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
], function (Observer, Objs, scoped) {
	return Observer.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				options = options || {};
				inherited.constructor.call(this, options);
				var self = this;
				this._observer = new window.MutationObserver(function (mutations) {
					Objs.iter(mutations, function (mutation) {
						for (var i = 0; i < mutation.addedNodes.length; ++i)
							self._nodeInserted(mutation.addedNodes[i], true);
					});
				});
				this._observer.observe(this._options.root || this._options.parent || document.body, {
					childList: true,
					subtree: !this._options.parent
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
	"module:Events"
], function (Observer, Events, scoped) {
	return Observer.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				options = options || {};
				inherited.constructor.call(this, options);
				var events = this.auto_destroy(new Events());
				events.on(document, "DOMNodeInserted", function (event) {
					this._nodeInserted(event.target, true);
				}, this);
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
	Observer.register(MutationObserverNodeInsertObserver, 3);
	Observer.register(DOMNodeInsertedNodeInsertObserver, 2);
	return {};
});

Scoped.define("module:Selection", [
    "module:Dom"
], function (Dom) {
	return {
		
		/** @suppress {checkTypes} */
		selectNode : function(node, offset) {
			var selection = null;
			var range = null;
			if (window.getSelection) {
				selection = window.getSelection();
				selection.removeAllRanges();
				range = document.createRange();
			} else if (document.selection) {
				selection = document.selection;
				range = selection.createRange();
			}
			if (offset) {
				range.setStart(node, offset);
				range.setEnd(node, offset);
				selection.addRange(range);
			} else {
				range.selectNode(node);
				selection.addRange(range);
			}
		},
	
		/** @suppress {checkTypes} */
		selectedHtml : function() {
			if (window.getSelection)
				return window.getSelection().toString();
			else if (document.selection)
				return document.selection.createRange().htmlText;
			return "";
		},
		
		/** @suppress {checkTypes} */
		selectionStartOffset: function () {
			if (window.getSelection)
				return window.getSelection().getRangeAt(0).startOffset;
			else if (document.selection)
				return document.selection.createRange().startOffset;
			return null;
		},
		
		/** @suppress {checkTypes} */
		selectionEndOffset: function () {
			if (window.getSelection)
				return window.getSelection().getRangeAt(0).endOffset;
			else if (document.selection)
				return document.selection.createRange().endOffset;
			return null;
		},
	
		/** @suppress {checkTypes} */
		selectionNonEmpty: function () {
			var start = this.selectionStart();
			var end = this.selectionEnd();
			return start && end && start && end && (start != end || this.selectionStartOffset() != this.selectionEndOffset());
		},
		
		/** @suppress {checkTypes} */
		selectionContained: function (node) {
			return node.contains(this.selectionStart()) && node.contains(this.selectionEnd());
		},
	
		/** @suppress {checkTypes} */
		selectionNodes: function () {
			var result = [];
			var start = this.selectionStart();
			var end = this.selectionEnd();
			result.push(start);
			var current = start;
			while (current != end) {
				current = Dom.traverseNext(current);
				result.push(current);
			}
			return result;
		},
		
		/** @suppress {checkTypes} */
		selectionLeaves: function () {
			return this.selectionNodes().filter(function (node) {
				return !node.hasChildNodes();
			});
		},
				
		/** @suppress {checkTypes} */
		selectionStartNode : function() {
			if (window.getSelection)
				return window.getSelection().getRangeAt(0).startContainer;
			else if (document.selection)
				return document.selection.createRange().startContainer;
			return null;
		},
		
		/** @suppress {checkTypes} */
		selectionAncestor : function() {
			if (window.getSelection)
				return window.getSelection().getRangeAt(0).commonAncestorContainer;
			else if (document.selection)
				return document.selection.createRange().parentElement();
			return null;
		},
		
		/** @suppress {checkTypes} */
		selectionStart : function() {
			if (window.getSelection)
				return window.getSelection().getRangeAt(0).startContainer;
			else if (document.selection)
				return document.selection.createRange().startContainer;
			return null;
		},
	
		/** @suppress {checkTypes} */
		selectionEnd : function() {
			if (window.getSelection)
				return window.getSelection().getRangeAt(0).endContainer;
			else if (document.selection)
				return document.selection.createRange().endContainer;
			return null;
		},
		
		/** @suppress {checkTypes} */
		selectionSplitOffsets: function () {
			var startOffset = this.selectionStartOffset();
			var endOffset = this.selectionEndOffset();
			var start = this.selectionStart();
			var end = this.selectionEnd();
			var single = start == end;
			if (endOffset < end.wholeText.length) {
				end.splitText(endOffset);
				if (single)
					start = end;
			}
			if (startOffset > 0) {
				start = start.splitText(startOffset);
				if (single)
					end = start;
			}
			this.selectRange(start, end);
		},
		
		/** @suppress {checkTypes} */
		selectRange: function (start_node, end_node, start_offset, end_offset) {
			var selection = null;
			var range = null;
			if (window.getSelection) {
				selection = window.getSelection();
				selection.removeAllRanges();
				range = document.createRange();
			} else if (document.selection) {
				selection = document.selection;
				range = selection.createRange();
			}
			range.setStart(start_node, start_offset || 0);
			range.setEnd(end_node, end_offset || end_node.data.length);
			selection.addRange(range);
		}
						
	};
});


Scoped.define("module:Upload.ChunkedFileUploader", [
     "module:Upload.FileUploader",
     "module:Upload.MultiUploader",
     "module:Blobs",
     "base:Promise",
     "base:Objs",
     "base:Tokens",
     "base:Ajax.Support"
], function (FileUploader, MultiUploader, Blobs, Promise, Objs, Tokens, AjaxSupport, scoped) {
	
	return FileUploader.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				this._multiUploader = new MultiUploader({
					uploadLimit: this._options.uploadLimit
				});
				this._options.identifierParameter = this._options.identifierParameter || "identifier";
				this._options.chunks = Objs.extend({
					size: 1000000,
					chunkNumberParameter: "chunknumber"
				}, this._options.chunks);
				this._options.assembly = Objs.extend({
					fileNameParameter: "filename",
					totalSizeParameter: "totalsize",
					chunkNumberParameter: "chunknumber",
					fileTypeParameter: "filetype",
					ajaxOptions: null
				}, this._options.assembly);
			},

			destroy: function () {
				this._multiUploader.destroy();
				inherited.destroy.call(this);
			},
			
			reset: function () {
				inherited.reset.call(this);
				this._multiUploader.destroy();
				this._multiUploader = new MultiUploader({
					uploadLimit: this._options.uploadLimit
				});
			},
			
			__generateIdentifier: function () {
				return Tokens.generate_token();
			},
		
			_upload: function () {
				var identifier = this.__generateIdentifier();
				var file = this._options.isBlob ? this._options.source : this._options.source.files[0];
				var fileReader = new FileReader();
				var arrayBufferPromise = Promise.create();
				fileReader.onloadend = function (e) {
					arrayBufferPromise.asyncSuccess(e.target.result);
				};
				fileReader.readAsArrayBuffer(file);
				arrayBufferPromise.success(function (arrayBuffer) {
					var chunkNumber = 0;
					while (chunkNumber * this._options.chunks.size < file.size) {
						var data = {};
						data[this._options.chunks.chunkNumberParameter] = chunkNumber+1;
						data[this._options.identifierParameter] = identifier;
						var offset = chunkNumber * this._options.chunks.size;
						var size = Math.min(this._options.chunks.size, file.size - offset);
						this._multiUploader.addUploader(this._multiUploader.auto_destroy(FileUploader.create({
							url: this._options.chunks.url || this._options.url,
							source: Blobs.createBlobByArrayBufferView(arrayBuffer, offset, size, file.type),
							data: Objs.extend(data, this._options.data)
						})));
						chunkNumber++;
					}
					this._multiUploader.on("error", function (error) {
						this._errorCallback(error);
					}, this).on("progress", function (uploaded, total) {
						this._progressCallback(uploaded, total);
					}, this).on("success", function () {
						var data = {};
						data[this._options.identifierParameter] = identifier;
						data[this._options.assembly.fileNameParameter] = file.name || "blob";
						data[this._options.assembly.totalSizeParameter] = file.size;
						data[this._options.assembly.chunkNumberParameter] = chunkNumber;
						data[this._options.assembly.fileTypeParameter] = file.type;
						AjaxSupport.execute(Objs.extend({
							method: "POST",
							uri: this._options.assembly.url || this._options.url,
							data: Objs.extend(data, this._options.data)
						}, this._options.assembly.ajaxOptions)).success(function () {
							this._successCallback();
						}, this).error(function (error) {
							this._errorCallback(error);
						}, this);
					}, this);
					this._multiUploader.upload();
				}, this);
			}
			
		};
	}, {
		
		supported: function (options) {
			return typeof Blob !== "undefined" && typeof FileReader !== "undefined" && typeof DataView !== "undefined" && options.serverSupportsChunked;
		}
		
	});	

});



Scoped.define("module:Upload.CordovaFileUploader", [
     "module:Upload.FileUploader"
], function (FileUploader, scoped) {
	return FileUploader.extend({scoped: scoped}, {
 		
 		_upload: function () {
 			var self = this;
 		    //var fileURI = this._options.source.localURL;
 			var fileURI = this._options.source.fullPath.split(':')[1];
 		    var fileUploadOptions = new window.FileUploadOptions();
 		    fileUploadOptions.fileKey = "file";
 		    fileUploadOptions.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
 		    fileUploadOptions.mimeType = this._options.source.type;
 		    fileUploadOptions.httpMethod = "POST";
 		    fileUploadOptions.params = this._options.data;
 		    var fileTransfer = new window.FileTransfer();
 		    fileTransfer.upload(fileURI, this._options.url, function (data) {
	    		self._successCallback(data);
 		    }, function (data) {
 		    	self._errorCallback(data);
 		    }, fileUploadOptions);
 		}
 		
 	}, {
 		
 		supported: function (options) {
 			var result =
 				!!navigator.device &&
 				!!navigator.device.capture &&
 				!!navigator.device.capture.captureVideo &&
 				!!window.FileTransfer &&
 				!!window.FileUploadOptions &&
 				!options.isBlob &&
 				("localURL" in options.source);
 			return result;
 		}
 		
 	});	
});


Scoped.define("module:Upload.FileUploader", [
    "base:Classes.ConditionalInstance",
    "base:Events.EventsMixin",
    "base:Objs",
    "base:Types",
    "base:Async",
    "base:Promise"
], function (ConditionalInstance, EventsMixin, Objs, Types, Async, Promise, scoped) {
	return ConditionalInstance.extend({scoped: scoped}, [EventsMixin, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				// idle, uploading, success, error
				this._state = "idle";
			},
			
			_setState: function (state, triggerdata) {
				this._state = state;
				this.trigger(state, triggerdata);
				this.trigger("state", state, triggerdata);
			},
			
			state: function () {
				return this._state;
			},
			
			data: function () {
				return this._data;
			},
			
			progress: function () {
				return {
					uploaded: this._uploaded,
					total: this._total
				};
			},
			
			reset: function () {
				if (this.state() === "error") {
					this._setState("idle");
					delete this._data;
					delete this._uploaded;
					delete this._total;
				}
			},

			upload: function () {
				if (this.state() !== "idle")
					return this;
				this._setState("uploading");
				this.__upload();
				return this;
			},
			
			__upload: function () {
				this._options.resilience--;
				this._upload();
			},
			
			_upload: function () {},
			
			_progressCallback: function (uploaded, total) {
				if (this.state() !== "uploading")
					return;
				this._uploaded = uploaded;
				this._total = total;
				this.trigger("progress", uploaded, total);
			},
			
			_successCallback: function (data) {
				if (this.state() !== "uploading")
					return;
				this._data = data;
				this._setState("success", data);
			},
			
			_errorCallback: function (data) {
				if (this.state() !== "uploading")
					return;
				if (this._options.resilience > 0) {
					Async.eventually(function () {
						this.__upload();
					}, this, this._options.resilience_delay);					
					return;
				}
				if (!this._options.essential) {
					this._successCallback({});
					return;
				}
				this._data = data;
				this._setState("error", data);
			},
			
			uploadedBytes: function () {
				return this._uploaded;
			},
			
			totalBytes: function () {
				if (this._total)
					return this._total;
				if (this._options.source) {
					if (!this._options.isBlob && this._options.source.files && this._options.source.files[0])
						return this._options.source.files[0].size;
					return this._options.source.size || 0;
				}
				return 0;
			}			
			
		};
	}], {
		
		_initializeOptions: function (options) {
			options = options || {};
			return Objs.extend({
				//url: "",
				//source: null,
				serverSupportChunked: false,
				serverSupportPostMessage: false,
				isBlob: typeof Blob !== "undefined" && options.source instanceof Blob,
				resilience: 1,
				resilience_delay: 1000,
				essential: true,
				data: {}
			}, options);
		}
		
	});
});


Scoped.define("module:Upload.CustomUploader", [
	"module:Upload.FileUploader"
], function (FileUploader, scoped) {
	return FileUploader.extend({scoped: scoped}, {
	
		_upload: function () {
			this.trigger("upload", this._options);
		},
		
		progressCallback: function (uploaded, total) {
			this._progressCallback(uploaded, total);
		},
		
		successCallback: function (data) {
			this._successCallback(data);
		},
		
		errorCallback: function (data) {
			this._errorCallback(data);
		}
	
	});	
});



Scoped.extend("module:Upload.FileUploader", [
	"module:Upload.FileUploader",
	"module:Upload.FormDataFileUploader",
	"module:Upload.FormIframeFileUploader",
	"module:Upload.CordovaFileUploader",
	"module:Upload.ChunkedFileUploader"
], function (FileUploader, FormDataFileUploader, FormIframeFileUploader, CordovaFileUploader, ChunkedFileUploader) {
	FileUploader.register(FormDataFileUploader, 2);
	FileUploader.register(FormIframeFileUploader, 1);
	FileUploader.register(CordovaFileUploader, 4);
	FileUploader.register(ChunkedFileUploader, 5);
	return {};
});




Scoped.define("module:Upload.FormDataFileUploader", [
    "module:Upload.FileUploader",
    "module:Info",
    "base:Ajax.Support",
    "base:Objs"
], function (FileUploader, Info, AjaxSupport, Objs, scoped) {
	return FileUploader.extend({scoped: scoped}, {
		
		_upload: function () {
			return AjaxSupport.execute({
				method: "POST",
				uri: this._options.url,
				decodeType: "text",
				data: Objs.extend({
					file: this._options.isBlob ? this._options.source : this._options.source.files[0]
				}, this._options.data)
			}, this._progressCallback, this).success(this._successCallback, this).error(this._errorCallback, this);
		}
		
	}, {
		
		supported: function (options) {
			if (Info.isInternetExplorer() && Info.internetExplorerVersion() <= 9)
				return false;
			try {
				new FormData();
			} catch (e) {
				return false;
			}
			return true;
		}
		
	});	
});





Scoped.define("module:Upload.FormIframeFileUploader", [
     "module:Upload.FileUploader",
     "base:Net.Uri",
     "base:Objs",
     "base:Async"
], function (FileUploader, Uri, Objs, Async, scoped) {
	return FileUploader.extend({scoped: scoped}, {
		
		_upload: function () {
			var self = this;
			var iframe = document.createElement("iframe");
			var id = "upload-iframe-" + this.cid();
			iframe.id = id;
			iframe.name = id;
			iframe.style.display = "none";
			var form = document.createElement("form");
			form.method = "POST";
			form.target = id;
			form.style.display = "none";
			document.body.appendChild(iframe);
			document.body.appendChild(form);
			var oldParent = this._options.source.parent;
			form.appendChild(this._options.source);
			if (!this._options.source.name)
				this._options.source.name = "file";
			Objs.iter(this._options.data, function (value, key) {
				var input = document.createElement("input");
				input.type = "hidden";
				input.name = key;
				input.value = value;
				form.appendChild(input);				
			}, this);
			var post_message_fallback = !("postMessage" in window);
			var handle_success = null;
			var message_event_handler = function (event) {
				handle_success(event.data);
			};
			iframe.onerror = function () {
				if (post_message_fallback)
					window.postMessage = null;
				window.removeEventListener("message", message_event_handler, false);
				if (oldParent)
					oldParent.appendChild(self._options.source);
				document.body.removeChild(form);
				document.body.removeChild(iframe);
				self._errorCallback();
			};				
			var post_message_key = this._options.serverPostMessageKey || "_postmessage";
			var post_message_id_key = this._options.serverPostMessageIdKey || "_postmessageid";
			var post_message_id_value = this.cid();
			var support_id = this._options.serverSupportPostMessageId;
			var query_params = {};
			query_params[post_message_key] = true;
			if (support_id) 
				query_params[post_message_id_key] = post_message_id_value;
			form.action = Uri.appendUriParams(this._options.url, query_params);
			form.encoding = form.enctype = "multipart/form-data";
			handle_success = function (raw_data) {
				try {
					var data = JSON.parse(raw_data);
					if (support_id && data[post_message_id_key] !== post_message_id_value)
						return;
					if (post_message_fallback)
						window.postMessage = null;
					if (oldParent)
						oldParent.appendChild(self._options.source);
					document.body.removeChild(form);
					document.body.removeChild(iframe);
					self._successCallback(data);
					Async.eventually(function () {
						window.removeEventListener("message", message_event_handler, false);
					});
				} catch (e) {}
			};
			window.addEventListener("message", message_event_handler, false);
			if (post_message_fallback) 
				window.postMessage = handle_success;
			form.submit();
		}
		
	}, {
		
		supported: function (options) {
			return !options.isBlob && options.serverSupportPostMessage;
		}
		
	});	
});



Scoped.define("module:Upload.MultiUploader", [
    "module:Upload.FileUploader",
    "base:Objs"
], function (FileUploader, Objs, scoped) {
	return FileUploader.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				this._uploaders = {};
				this._uploadLimit = this._options.uploadLimit || 5;
				this._uploadingCount = 0;
				this._end = !this._options.manualEnd;
			},
			
			end: function () {
				this._end = true;
				this._updateState();
			},
			
			addUploader: function (uploader) {
				this._uploaders[uploader.cid()] = uploader;
				uploader.on("state", this._updateState, this);
				uploader.on("progress", this._updateProgress, this);
				if (this.state() === "uploading") {
					if (uploader.state() === "error")
						uploader.reset();
					if (uploader.state() === "idle" && this._uploadingCount < this._uploadLimit) {
						this._uploadingCount++;
						uploader.upload();
					}
				}
				return this;
			},
			
			_upload: function () {
				Objs.iter(this._uploaders, function (uploader) {
					if (uploader.state() === "error")
						uploader.reset();
					if (uploader.state() === "idle" && this._uploadingCount < this._uploadLimit) {
						this._uploadingCount++;
						uploader.upload();
					}
				}, this);
				this._updateState();
			},
			
			_updateState: function () {
				if (this.state() !== "uploading")
					return;
				this._uploadingCount = 0;
				var error = false;
				var idleCount = 0;
				Objs.iter(this._uploaders, function (uploader) {
					switch (uploader.state()) {
						case "uploading":
							this._uploadingCount++;
							break;
						case "error":
							error = true;
							break;
						case "idle":
							idleCount++;
							break;
					}
				}, this);
				if (idleCount > 0 && this._uploadingCount < this._uploadLimit) {
					Objs.iter(this._uploaders, function (uploader) {
						if (this._uploadingCount < this._uploadLimit && uploader.state() === "idle") {
							uploader.upload();
							idleCount--;
							this._uploadingCount++;
						}
					}, this);
				}
				if (this._uploadingCount > 0)
					return;
				if (!this._end)
					return;
				var datas = [];
				Objs.iter(this._uploaders, function (uploader) {
					var result = (error && uploader.state() === "error") || (!error && uploader.state() === "success") ? uploader.data() : undefined;
					datas.push(result);
				}, this);
				if (error > 0)
					this._errorCallback(datas);
				else
					this._successCallback(datas);
			},
			
			_updateProgress: function () {
				if (this.state() !== "uploading")
					return;
				this._progressCallback(this.uploadedBytes(), this.totalBytes());
			},
			
			uploadedBytes: function () {
				var uploaded = 0;
				Objs.iter(this._uploaders, function (uploader) {
					uploaded += uploader.uploadedBytes();
				}, this);
				return uploaded;
			},
			
			totalBytes: function () {
				var total = 0;
				Objs.iter(this._uploaders, function (uploader) {
					total += uploader.totalBytes();
				}, this);
				return total;
			}

		};
	});
});




Scoped.define("module:Upload.StreamingFileUploader", [
     "module:Upload.FileUploader",
     "module:Upload.MultiUploader",
     "base:Promise",
     "base:Objs",
     "base:Tokens",
     "base:Ajax.Support"
], function (FileUploader, MultiUploader, Promise, Objs, Tokens, AjaxSupport, scoped) {
	
	return FileUploader.extend({scoped: scoped}, function (inherited) {
		return {
			
			constructor: function (options) {
				inherited.constructor.call(this, options);
				this._multiUploader = new MultiUploader({
					uploadLimit: this._options.uploadLimit,
					manualEnd: true
				});
				this._options.identifierParameter = this._options.identifierParameter || "identifier";
				this._options.chunks = Objs.extend({
					chunkNumberParameter: "chunknumber"
				}, this._options.chunks);
				this._options.assembly = Objs.extend({
					totalSizeParameter: "totalsize",
					chunkNumberParameter: "chunknumber",
					ajaxOptions: null
				}, this._options.assembly);
				this._identifier = this.__generateIdentifier();
				this._chunkNumber = 0;
				this._totalSize = 0;
			},

			destroy: function () {
				this._multiUploader.destroy();
				inherited.destroy.call(this);
			},
			
			reset: function () {
				inherited.reset.call(this);
				this._multiUploader.destroy();
				this._multiUploader = new MultiUploader({
					uploadLimit: this._options.uploadLimit
				});
				this._identifier = this.__generateIdentifier();
				this._chunkNumber = 0;
				this._totalSize = 0;
			},
			
			__generateIdentifier: function () {
				return Tokens.generate_token();
			},
			
			addChunk: function (blob) {
				var data = {};
				data[this._options.chunks.chunkNumberParameter] = this._chunkNumber+1;
				data[this._options.identifierParameter] = this._identifier;
				this._multiUploader.addUploader(this._multiUploader.auto_destroy(FileUploader.create({
					url: this._options.chunks.url || this._options.url,
					source: blob,
					data: Objs.extend(data, this._options.data)
				})));
				this._chunkNumber++;
				this._totalSize += blob.size;
			},
			
			end: function () {
				this._multiUploader.end();
			},
		
			_upload: function () {
				this._multiUploader.on("error", function (error) {
					this._errorCallback(error);
				}, this).on("progress", function (uploaded, total) {
					this._progressCallback(uploaded, total);
				}, this).on("success", function () {
					var data = {};
					data[this._options.identifierParameter] = this._identifier;
					data[this._options.assembly.totalSizeParameter] = this._totalSize;
					data[this._options.assembly.chunkNumberParameter] = this._chunkNumber;
					AjaxSupport.execute(Objs.extend({
						method: "POST",
						uri: this._options.assembly.url || this._options.url,
						data: Objs.extend(data, this._options.data)
					}, this._options.assembly.ajaxOptions)).success(function () {
						this._successCallback();
					}, this).error(function (error) {
						this._errorCallback(error);
					}, this);
				}, this);
				this._multiUploader.upload();
			}
			
		};
	}, {
		
		supported: function (options) {
			return typeof Blob !== "undefined" && options.serverSupportsChunked;
		}

	});	

});

}).call(Scoped);