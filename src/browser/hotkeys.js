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
], function(Objs) {
    return {

        SHIFT_NUMS: {
            "`": "~",
            "1": "!",
            "2": "@",
            "3": "#",
            "4": "$",
            "5": "%",
            "6": "^",
            "7": "&",
            "8": "*",
            "9": "(",
            "0": ")",
            "-": "_",
            "=": "+",
            ";": ":",
            "'": "\"",
            ",": "<",
            ".": ">",
            "/": "?",
            "\\": "|"
        },

        SPECIAL_KEYS: {
            'esc': 27,
            'escape': 27,
            'tab': 9,
            'space': 32,
            'return': 13,
            'enter': 13,
            'backspace': 8,

            'scrolllock': 145,
            'scroll_lock': 145,
            'scroll': 145,
            'capslock': 20,
            'caps_lock': 20,
            'caps': 20,
            'numlock': 144,
            'num_lock': 144,
            'num': 144,

            'pause': 19,
            'break': 19,

            'insert': 45,
            'home': 36,
            'delete': 46,
            'end': 35,

            'pageup': 33,
            'page_up': 33,
            'pu': 33,

            'pagedown': 34,
            'page_down': 34,
            'pd': 34,

            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40,

            'f1': 112,
            'f2': 113,
            'f3': 114,
            'f4': 115,
            'f5': 116,
            'f6': 117,
            'f7': 118,
            'f8': 119,
            'f9': 120,
            'f10': 121,
            'f11': 122,
            'f12': 123
        },

        MODIFIERS: ["ctrl", "alt", "shift", "meta"],

        keyCodeToCharacter: function(code) {
            if (code == 188)
                return ",";
            else if (code == 190)
                return ".";
            return String.fromCharCode(code).toLowerCase();
        },

        handleKeyEvent: function(hotkey, e, options) {
            options = Objs.extend({
                "disable_in_input": false,
                "keycode": false
            }, options);
            var keys = hotkey.toLowerCase().split("+");
            if (options.disable_in_input) {
                var element = e.target || e.srcElement || null;
                if (element && element.nodeType == 3)
                    element = element.parentNode;
                if (element && (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA'))
                    return false;
            }
            var code = e.keyCode || e.which || 0;
            var character = this.keyCodeToCharacter(code);
            var kp = 0;
            var modifier_map = {};
            Objs.iter(this.MODIFIERS, function(mod) {
                modifier_map[mod] = {
                    pressed: e[mod + "Key"],
                    wanted: false
                };
            }, this);
            Objs.iter(keys, function(key) {
                if (key in modifier_map) {
                    modifier_map[key].wanted = true;
                    kp++;
                } else if (key.length > 1) {
                    if (this.SPECIAL_KEYS[key] == code)
                        kp++;
                } else if (options.keycode) {
                    if (options.keycode == code)
                        kp++;
                } else if (character == key || (e.shiftKey && this.SHIFT_NUMS[character] == key)) {
                    kp++;
                }
            }, this);
            /**
             * Allow to use use several keys for one action
             * @example: ba-hotkey:space^enter="function(){}"
             */
            var multipleKeys = hotkey.toLowerCase().split("^");
            if(multipleKeys.length > 1) {
                Objs.iter(multipleKeys, function(key) {
                    if (key.length > 1) {
                        if (this.SPECIAL_KEYS[key] == code)
                            kp++;
                    }
                }, this);
            }
            return kp == keys.length && Objs.all(modifier_map, function(data) {
                return data.wanted == data.pressed;
            });
        },

        register: function(hotkey, callback, context, options) {
            options = Objs.extend({
                "type": "keyup",
                "propagate": false,
                "disable_in_input": false,
                "target": document,
                "keycode": false
            }, options);
            var self = this;
            var func = function(e) {
                if (self.handleKeyEvent(hotkey, e, options)) {
                    if (!options.propagate) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    callback.call(context || this, e);
                }
            };
            options.target.addEventListener(options.type, func, false);
            return {
                target: options.target,
                type: options.type,
                func: func
            };
        },

        unregister: function(handle) {
            handle.target.removeEventListener(handle.type, handle.func, false);
        }

    };
});