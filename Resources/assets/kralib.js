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

})(this);
