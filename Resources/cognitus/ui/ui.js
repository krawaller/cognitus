(function() {
	
	function containerAnimationCallback(ViewId,childRole){
		pb.pub("/"+ViewId+"/arrivedatchildrole/"+childRole);
	};
	
	function createComposition(o){ // o contains array views
		if (!o.views){
			throw "No views array to create list from in "+o.ViewId+"!";
		}
		o.childrenByRoles = {};
		o.views.forEach(function(e,i){
			o.childrenByRoles[i] = e;
			e.opacity = 0;
		});
		o.defaultChildRole = (o.defaultChildRole || 0);
		o.animateToRole = function(me,role){
			for(var r in me.childrenByRoles){
				var child = me.childrenByRoles[r];
				if (r == role){
					if (!child.opacity){
						child.animate({opacity:1});
					}
				} else {
					if (child.opacity){
						child.animate({opacity:0});
					}
				}
			}
		};
		var view = createContainer(o);
		return view;
	};
	
	function createFilmStrip(o){ // o contains array views
		if (!o.views){
			throw "No views array to create film strip from in "+o.ViewId+"!";
		}
		o.childrenByRoles = {};
		o.views.forEach(function(e,i){
			o.childrenByRoles[i] = e;
			e.left = $$.platformWidth * i;
		});
		o.animateToRole = function(me,role){
			me.frame.animate({
				duration: $$.animationDuration,
				left: $$.platformWidth * role * -1
			},function(){containerAnimationCallback(me.ViewId,role);});
		};
		var filmstrip = createContainer(K.merge({defaultChildRole: 0},o));
		filmstrip.frame.width = $$.platformWidth*o.views.length;
		filmstrip.frame.left = 0;
		return filmstrip;
	};
	
	function createContainer(o){ // o contains childrenByRoles obj and animateToRole function
		if (!o.ViewId){
			throw "No ViewId provided!";
		}
		if (!o.animateToRole){
			throw "No animateToRole function provided in "+o.ViewId+"!";
		}
		if (!o.childrenByRoles){
			throw "No childrenByRoles object provided in "+o.ViewId+"!";
		}
		if (o.defaultChildRole === undefined){
			throw "No defaultChildRole provided for "+o.ViewId+"!";
		}
		var view = K.create(K.merge({k_type: "View",width: $$.platformWidth},o)),
			frame = K.create({k_type: "View"}),
			descendants = {};
		Ti.API.log(["Children in "+o.ViewId,o.childrenByRoles]);
		for(var role in o.childrenByRoles){
			var child = o.childrenByRoles[role];
			Ti.API.log([child,role]);
			descendants[child.ViewId] = role;
			if (child.descendants){
				for(var descendantId in child.descendants){
					descendants[descendants] = role;
				}
			}
			frame.add(child);
		}
		view.add(frame);
		view.frame = frame;
		view.descendants = descendants;
		view.render = function(ViewId,animated){
			var roleInContainer = ((descendants[ViewId]) || (o.defaultChildRole));
			if (roleInContainer === undefined){
				throw "Couldn't find "+ViewId+" or default in container "+view.ViewId+"!";
			}
		//	if (!animated && roleInContainer !== view.currentChildRole){
				pb.pub("/"+o.ViewId+"/animateTo",roleInContainer);
				o.animateToRole(view,roleInContainer);
				animated = true;
		//	}
			view.currentChildRole = roleInContainer;
			Ti.API.log(["RENDER",view.ViewId,ViewId,roleInContainer,o.childrenByRoles[roleInContainer]]);
			o.childrenByRoles[roleInContainer].render(ViewId,animated);
		};
		return view;
	}
	
	function createPage(o){
		if (!o.ViewId){
			throw "No ViewId provided!";
		}
		if (!o.render){
			throw "No render function provided for "+o.ViewId+"!";
		}
		var view = K.create(K.merge({k_type:"View",width:$$.platformWidth},o));
		view.render = function(){
			C.state.currentPage = view;
			Ti.API.log(["RENDER CALLED IN "+o.ViewId+" PAGE!",o.ViewTitle]);
			o.render();
			pb.pub("/newtitle",o.ViewTitle);
		};
		return view;
	}
	
	function createRoot(view){
		var root = K.create({k_type:"View"});
		root.add(view);
		if (!view.render){
			throw "What the heck, root view has no render!";
		}
		pb.sub("/navto",function(targetViewId){
			view.render(targetViewId);
		});
		pb.sub("/appstart",function(){
			view.render();
		});
		return root;
	}

	// expose
	C.ui = {
		createComposition: createComposition,
		createContainer: createContainer,
		createRoot: createRoot,
		createPage: createPage,
		createFilmStrip: createFilmStrip
	};
	
})();

Ti.include("/cognitus/ui/styles.js");

Ti.include("/cognitus/ui/applicationWindow.js");
Ti.include("/cognitus/ui/skillsView.js");
Ti.include("/cognitus/ui/crisisView.js");
Ti.include("/cognitus/ui/mindfulness.js");
Ti.include("/cognitus/ui/distresstolerance.js");
