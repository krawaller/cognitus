(function(global) {

	var slice = Array.prototype.slice, splice = Array.prototype.splice;

	String.prototype.truncate = function(len) {
		return this.length > len ? this.substr(0, len) + "..." : this + "";
	};

	String.prototype.clean = function() {
		return this.replace(/\xA0/g, '').replace(/\s+/g, ' ');
	};

	/**
	 * Insert @parameters into string
	 * @param {Object} obj
	 * @param {Object} plain
	 */
	String.prototype.esc = function(obj, func) {
		return this.replace(/@([A-Za-z_]+)/g, function($0, $1) {
			return typeof obj[$1] != "undefined" ? (func ? func(obj[$1]) : obj[$1]) : $0;
		});
	};

	/**
	 * Bind a function to a context
	 * @param ctx Context to run the function in
	 * @return Function applying new scope to original function
	 */
	Function.prototype.bind = function(ctx) {
		var fn = this;
		return function() {
			fn.apply(ctx || fn, slice.call(arguments));
		};
	};

	Function.prototype.defer = function(ms) {
		var fn = this;
		//return function(){
		setTimeout(function() {
			fn.apply(fn, slice.call(arguments));
		},
		ms);
		//}; 
	};

    var K = (global.K = global.K || {});

	var osname = Ti.Platform.osname;
	
	K.os = function(map) {
		var def = map.def || null; //default function or value
		if (typeof map[osname] != 'undefined') {
			if (typeof map[osname] == 'function') {
				return map[osname]();
			} else {
				return map[osname];
			}
		} else {
			if (typeof def == 'function') {
				return def();
			} else {
				return def;
			}
		}
	};

	K.merge = function(){
		if(arguments.length === 1){
			return arguments[0];
		}
		if (arguments.length === 0){
			throw("K.merge called without any arguments!");
		}
		if (typeof arguments[0] !== "object"){
			Ti.API.log(arguments[0]);
			throw("K.merge called with non-object first argument!");
		}
		if (typeof arguments[1] !== "object"){
			Ti.API.log(arguments[1]);
			throw("K.merge called with non-object argument!");
		}
        for (var property in arguments[1]) {
            if (!arguments[0].hasOwnProperty(property)){ arguments[0][property] = arguments[1][property]; }
        }
        splice.call(arguments,1,1);
        return arguments.length === 1 ? arguments[0] : K.merge.apply(0,arguments);
    };

	K.isFunc = function(o){
		return toString.call(o) === "[object Function]";
	};

	var styles = {};
	K.setStyles = function(o){
		styles = o;
	};

	K.create = function(o){
        if (typeof o === "string"){
            o = { k_type: "Label", text: o };
        }
        if (o.k_class){
             if (typeof o.k_class === "string") {
                 o = K.merge(o,styles[o.k_class] || {});
             }
             else {
                 o.k_class.forEach(function(s){
                      o = K.merge(o,styles[s] || {});
                 });
             }
        }
        if (!o.k_type) {
            if (o.k_parent_type == "TableViewSection" || o.k_parent_type == "TableView"){
                o.k_type = "TableViewRow";
            } 
            else if (o.text) {
                o.k_type = "Label";
            }
        }
        if (!o.k_type){
            //Ti.API.log(o);
            throw "What the heck, no type!";
        }
        o.k_children = o.k_children || [];
        if (o.k_type == "TableViewSection" && o.headerTitle){
            o.headerView = K.create({
                k_type:"View",
                k_class: "tableviewheaderview",
                k_children:[{
                    text: o.headerTitle,
                    k_class: "tableviewheaderlabel"
                }]
            });
            delete o.headerTitle;
        }
        if (o.k_type == "Window" && styles[o.url]){
             o = K.merge(o,styles[o.url]);
        }
		//o.init && K.isFunc(o.init) && o.init.call(o);
	
        /*if (o.k_type == "WebView" && (o.k_templatefile || o.k_temlatehtml)){
            o = K.merge(o, {
                url: "../views/"+ (o.k_masterpage || "_masterpage.html"),
                k_templateview: true,
				opacity: 0,
				k_events: {
					load: function(){
						setTimeout(function(){
							e.animate({ opacity: 1, duration: 400 });
						}, 50);
					}
				}
            });
        }*/
        
        // Delegate to correct Ti Factory
        o.k_module = o.k_module || (['MapView', 'Annotation'].indexOf(o.k_type) != -1 ? 'Map' : 'UI');
        // Point MapView to Ti.Map.createView
        o.k_type = o.k_type == 'MapView' ? 'View' : o.k_type;
        
        if (!typeof Ti[o.k_module]["create"+o.k_type] == "function"){
            throw "No constructor found for "+o.k_type+"!";
        }
        o = K.merge(o, (styles[o.k_type]) || ({}), (styles.all || {}));
		var e = Ti[o.k_module]["create"+o.k_type](o);
        e.k_def = o;
        /*if (o.k_templateview){
            var template = (o.k_templatefile ? Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory+"/cognitus/html/"+o.k_templatefile).read().text : o.k_templatehtml),
                opts = { template: template, data: {data: o.k_templatedata} };
            e.addEventListener("load",function(){ e.evalJS("render("+JSON.stringify(opts)+")"); });
        }*/
        if (o.k_events){
			if(o.k_events.app){
				for(var ev in o.k_events.app){
                    Ti.App.addEventListener(ev, o.k_events.app[ev].bind(o.k_events.scope||o.k_events.app.scope||e, e));
                }
				delete o.k_events.app;
			}
            for(var ev in o.k_events){
                e.addEventListener(ev,o.k_events[ev].bind(o.k_events.scope||e, e));
            }
        }
		if (o.k_subs){
			for(var ev in o.k_subs){
				pb.sub(ev,o.k_subs[ev],e);
			}
		}

        if (o.k_click){
            e.addEventListener("click",o.k_click);
        }
        if (o.k_children.length){
            var child, children = [], i = 0, childrenById = {};
            o.k_children.map(function(c){
                var child = K.create(K.merge(c,{k_parent_type:o.k_type})),
                    func = o.k_type=="TableView" && child.k_def.k_type == "TableViewRow" ? "appendRow" : "add";

                childrenById[i++] = child;
                if (c.k_id){
                    childrenById[c.k_id] = child;
					e["k_child_"+c.k_id] = child;
					e["k_child_"+i] = child;
                }
                if (o.k_type == "TableView" && child.k_def.k_type == "TableViewSection"){
                    children.push(child);
                } else {
                    e[func](child); 
                }
            });
            if (o.k_type == "TableView" && children.length){
                e.setData(children);
            }
            e.k_children = childrenById;
        }
		//o.k_events && o.k_events.beforerender && o.k_events.beforerender(e);
		/*if(o.k_type == "Window" && o.tab){
			o.tab.open(e);
		}*/
        return e;
    };



	/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 */

	var dateFormat = function () {
		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function (val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) val = "0" + val;
				return val;
			};

		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc) {
			var dF = dateFormat;

			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}

			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date;
			if (isNaN(date)) throw SyntaxError("invalid date");

			mask = String(dF.masks[mask] || mask || dF.masks["default"]);

			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}

			var	_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				M = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  dF.i18n.dayNames[D],
					dddd: dF.i18n.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  dF.i18n.monthNames[m],
					mmmm: dF.i18n.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	}();

	// Some common format strings
	dateFormat.masks = {
		"default":      "ddd mmm dd yyyy HH:MM:ss",
		shortDate:      "m/d/yy",
		mediumDate:     "mmm d, yyyy",
		longDate:       "mmmm d, yyyy",
		fullDate:       "dddd, mmmm d, yyyy",
		shortTime:      "h:MM TT",
		mediumTime:     "h:MM:ss TT",
		longTime:       "h:MM:ss TT Z",
		isoDate:        "yyyy-mm-dd",
		isoTime:        "HH:MM:ss",
		isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
	};

	// Internationalization strings
	dateFormat.i18n = {
		dayNames: [
			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
		],
		monthNames: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
		]
	};

	// For convenience...
	Date.prototype.format = function (mask, utc) {
		return dateFormat(this, mask, utc);
	};
	
	K.dateFormat = dateFormat;


})(this);
