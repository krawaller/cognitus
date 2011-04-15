(function() {

    function containerAnimationCallback(ViewId, childRole) {
        pb.pub("/" + ViewId + "/arrivedatchildrole/" + childRole);
    };

    function createList(o) {
        if (!o.views) {
            throw "No views array to create list from in " + o.ViewId + "!";
        }
        o.childrenByRoles = {};
        o.views.forEach(function(e, i) {
            o.childrenByRoles[i] = e;
            e.opacity = 0;
        });
        o.switchToRole = function(me, role, noanimation) {
            for (var r in me.childrenByRoles) {
                Ti.API.log("---- " + r + " --- " + role, r == role);
                var child = me.childrenByRoles[r];
                if (r == role) {
                    if (noanimation) {
                        child.opacity = 1;
                    } else {
                        child.animate({
                            opacity: 1
                        });
                    }
                } else {
                    if (noanimation) {
                        child.opacity = 0;
                    } else {
                        child.animate({
                            opacity: 0
                        });
                    }
                }
            }
        };
        var view = createContainer(o);
        return view;
    }


    function createHeadedList(o) {
        // o contains array views, rowName function, table opts, backLabel
        if (!o.views) {
            throw "No views array to create list from in " + o.ViewId + "!";
        }
        o.childrenByRoles = {};
        var rows = [];
        var backbtn = K.create({
            //k_class: "NavButtonView",
            k_type: "View",
            backgroundColor: "#CCC",
            top: -50,
            right: 10,
            height: 30,
            width: 60,
            borderColor: "#000",
            borderWidth: 1,
            opacity: 1,
            k_children: [{
                label: "NavButtonLabel",
                text: "<---"
            }],
            k_click: function() {
                pb.pub("/navto", o.views[0].ViewId);
            }
        });
        o.views.forEach(function(e, i) {
            o.childrenByRoles[i] = e;
            e.opacity = 0;
            if (i) {
                var row = K.create(K.merge({
                    k_type: "TableViewRow",
                    targetViewId: e.ViewId
                },
                (o.tablerow || {})));
                C.content.setObjectText(row, e.ViewId + (e.SubId ? "_" + e.SubId: "") + "_title", "title");
                rows.push(row);
            }
        });
        var table = K.create(K.merge({
            k_type: "TableView",
            k_click: function(e) {
                pb.pub("/navto", e.row.targetViewId, "FJU!");
            },
            data: rows
        },
        o.table || {}));
        /*	pb.sub("/"+o.ViewId+"/switchTo",function(role){
			if (role!=0){
				backbtn.animate({top:10});
			}
			else {
				backbtn.animate({top:-50});
			}
		});*/

        o.views[0].add(table);
        o.defaultChildRole = (o.defaultChildRole || 0);
        o.switchToRole = function(me, role, noanimation) {
            Ti.API.log("headed list switching to " + role + " with" + (noanimation ? "out": "") + " animation");
            if (role != 0) {
                backbtn.animate({
                    top: 10
                });
            }
            else {
                backbtn.animate({
                    top: -50
                });
            }
            for (var r in me.childrenByRoles) {
                Ti.API.log("---- " + r + " --- " + role, r == role);
                var child = me.childrenByRoles[r];
                if (r == role) {
                    if (noanimation) {
                        child.opacity = 1;
                    } else {
                        child.animate({
                            opacity: 1
                        });
                    }
                } else {
                    if (noanimation) {
                        child.opacity = 0;
                    } else {
                        child.animate({
                            opacity: 0
                        });
                    }
                }
            }
        };
        var view = createContainer(o);
        view.frame.add(backbtn);
        return view;
    };

    function createFilmStrip(o) {
        // o contains array views
        if (!o.views) {
            throw "No views array to create film strip from in " + o.ViewId + "!";
        }
        o.childrenByRoles = {};
        o.views.forEach(function(e, i) {
            o.childrenByRoles[i] = e;
            e.left = $$.platformWidth * i;
        });
        o.switchToRole = function(me, role, noanimation) {
            if (noanimation) {
                me.frame.left = $$.platformWidth * role * -1;
            } else {
                me.frame.animate({
                    duration: $$.animationDuration,
                    left: $$.platformWidth * role * -1
                },
                function() {
                    containerAnimationCallback(me.ViewId, role);
                });
            }
        };
        var filmstrip = createContainer(K.merge({
            defaultChildRole: 0
        },
        o));
        filmstrip.frame.width = $$.platformWidth * o.views.length;
        filmstrip.frame.left = 0;
        return filmstrip;
    };

    function createContainer(o) {
        // o contains childrenByRoles obj and animateToRole function
        if (!o.ViewId) {
            throw "No ViewId provided!";
        }
        if (!o.switchToRole) {
            throw "No switchToRole function provided in " + o.ViewId + "!";
        }
        if (!o.childrenByRoles) {
            throw "No childrenByRoles object provided in " + o.ViewId + "!";
        }
        if (o.defaultChildRole === undefined) {
            throw "No defaultChildRole provided for " + o.ViewId + "!";
        }
        var view = K.create(K.merge({
            k_type: "View",
            width: $$.platformWidth
        },
        o)),
        frame = K.create({
            k_type: "View"
        }),
        descendants = {};
        for (var role in o.childrenByRoles) {
            var child = o.childrenByRoles[role];
            Ti.API.log([child, role]);
            descendants[child.ViewId] = role;
            if (child.descendants) {
                for (var descendantId in child.descendants) {
                    descendants[descendants] = role;
                }
            }
            frame.add(child);
        }
        view.add(frame);
        view.frame = frame;
        view.descendants = descendants;
        view.isContainer = true;
        view.render = function(rargs) {
            // rargs contains ViewId,animated,arg,path
            var roleInContainer = ((descendants[rargs.ViewId]) ||   (o.defaultChildRole));
            rargs.path.push[o.ViewId];
            if (roleInContainer === undefined) {
                throw "Couldn't find " + rargs.ViewId + " or default in container " + view.ViewId + "!";
            }
            var child = o.childrenByRoles[roleInContainer];
            if (view.currentChildRole != roleInContainer) {
                o.switchToRole(view, roleInContainer, rargs.animated);
                pb.pub("/" + o.ViewId + "/switchTo", roleInContainer, rargs.animated);
                rargs.animated = true;
                view.currentChildRole = roleInContainer;
                Ti.API.log(["RENDER", view.ViewId, rargs.ViewId, roleInContainer, o.childrenByRoles[roleInContainer]]);
            }
            if (child.isContainer) {
                child.render(rargs);
            } else {
                child.render(rargs.arg);
            }
        };
        return view;
    }

    function createPage(o) {
        if (!o.ViewId) {
            throw "No ViewId provided!";
        }
        var view = K.create(K.merge({
            k_type: "View",
            width: $$.platformWidth
        },
        o));
        Ti.API.log("created page " + o.ViewId + ", subid: " + o.SubId);
        view.render = function(arg) {
            C.state.currentPage = view;
            if (o.render) {
                o.render();
            }
            C.state.currentTitle = C.content.getText(view.ViewId + "_title");
            Ti.API.log(["RENDER CALLED IN " + o.ViewId + " PAGE with arg " + arg + "!", C.state.currentTitle]);
            pb.pub("/newtitle");
        };
        return view;
    }

    function createLabel(id, o) {
        var label = K.create(K.merge({
            k_type: "Label"
        },
        o || {}));
        C.content.setObjectText(label, id);
        return label;
    }

    function createRoot(view) {
        var root = K.create({
            k_type: "View"
        });
        root.add(view);
        if (!view.render) {
            throw "What the heck, root view has no render!";
        }
        pb.sub("/navto",
        function(targetViewId, arg) {
            view.render({
                ViewId: targetViewId,
                animated: false,
                arg: arg,
                path: []
            });
        });
        pb.sub("/appstart",
        function() {
            view.render({
                path: []
            });
        });
        return root;
    }

    function createAppWindow(apptabs) {

        // ****************** Building the app structure from the tree
        function processContent(o, tabnr, back, listid, listplace) {
            if (o.listid) {
                // processing a List
                lists[o.listid] = [];
                o.pages.forEach(function(page,i) {
                    lists[o.listid].push({
                        navtextid: page.navtextid,
                        pageid: page.pageid
                    });
                    processContent(page, tabnr, back, o.listid, i);
                });
            } else {
                // processing a Page
                pages[o.pageid] = {
                    view: o.view,
                    tabnr: tabnr,
                    back: (o.back) || (back),
                    listid: listid,
					listplace: listplace
                };
                if (!tabs[tabnr].rootpageid) {
                    tabs[tabnr].rootpageid = o.pageid;
                }
                if (o.sub) {
                    processContent(o.sub, tabnr, back);
                }
            }
        }
        var tabs = [],
        lists = {},
        pages = {};
        apptabs.forEach(function(tab, i) {
            tabs.push({
                textid: tab.textid
            });
            processContent(tab.content, i);
        });

        // ***************** Creating the window object and adding the pages
        var win = K.create({
            k_type: "Window",
            exitOnClose: true,
            orientationModes: [Ti.UI.PORTRAIT],
            fullscreen: true
        });

        for (var pid in pages) {
            var page = pages[pid];
            page.view.opacity = 0;
            win.add(page.view);
        }

        // ****************** Adding the tabs
        tabmarker = K.create({
            k_type: "View",
            width: 10,
            backgroundColor: "#000",
            bottom: 0,
            height: 50,
            left: 30
        });
        win.add(tabmarker);
        tabs.forEach(function(tab, i) {
            var btn = K.create({
                k_class: "NavButtonView",
                width: 50,
                bottom: 10,
                left: 10 + i * 60,
                k_children: [{
                    k_class: "NavButtonLabel",
                    text: "FOO"
                }],
                k_click: function(e) {
                    pb.pub("/navto", tab.rootpageid);
                }
            });
            C.content.setObjectText(btn.k_children[0], tab.textid);
            win.add(btn);
        });

        // ****************** Backbutton
        var backbtn = K.create({
            k_class: "NavButtonView",
            width: 50,
            top: -60, // will be animated to 10
            right: 10,
            k_children: [{
                k_class: "NavButtonLabel",
                text: "FOOBAR"
            }],
            k_click: function(e) {
                pb.pub("/navto", C.state.currentBack.pageid);
            }
        });
        C.content.setObjectText(backbtn.k_children[0],
        function() {
            return (C.state.currentBack && C.state.currentBack.textid) || "FOOBAR";
        });

        win.add(backbtn);

        // ****************** Listbuttons
		var listmarker = K.create({
			k_type: "View",
			width: 70,
			backgroundColor: "#000",
			height: 10,
			right: -80, // will be animated to 0
			top: 60
		});
		win.add(listmarker);
        var listbtns = [];
        for (var i = 0; i < 5; i++) {
            (function(i) {
                listbtns[i] = K.create({
                    k_class: "NavButtonView",
                    width: 50,
                    top: 50 + 40 * i,
                    right: -60, // will be animated to 10
                    k_children: [{
                        k_class: "NavButtonLabel",
                        text: "FOOBAR"
                    }],
                    k_click: function(e) {
                        pb.pub("/navto", C.state.currentList[i].pageid);
                    }
                });
                C.content.setObjectText(listbtns[i].k_children[0],function() {
                    return (C.state.currentList && C.state.currentList[i] && C.state.currentList.textid) || "FOOBAR";
                });
				win.add(listbtns[i]);
            })(i);
        }
		var updatelistbtns = function(pageid,arg){
			var topage = ((pages[((pageid) || (C.state.currentPageId))])||{}),
				list = lists[topage.listid];
			if (list){
				listbtns.forEach(function(b,i){
					if (i<list.length){
						b.k_children[0].text = C.content.getText(list[i].navtextid);
					}
				});
			}
		};
		pb.sub("/navto",updatelistbtns);
		pb.sub("/updatetext",updatelistbtns);

        // ****************** Title bits
        var titleview = K.create({
            k_type: "View",
            height: 30,
            top: 10,
            width: 200,
            left: 10,
            borderWidth: 1,
            borderColor: "#000",
            backgroundColor: "#CCC",
            k_children: [{
                k_class: "TitleLabel"
            }]
        }),
        titlelabel = titleview.k_children[0];
        win.add(titleview);

        function updateTitle(noanim) {
            var title = C.state.currentTitle;
            if (titlelabel.text !== title) {
                if (noanim === true) {
                    titlelabel.text = title;
                } else {
                    titleview.animate({
                        transform: Ti.UI.create2DMatrix().scale(1, 0.1)
                    },
                    function() {
                        titlelabel.text = title;
                        titleview.animate({
                            transform: Ti.UI.create2DMatrix().scale(1, 1)
                        });
                    });
                }
            }
        }
        pb.sub("/newtitle", updateTitle);
        pb.sub("/updatetext", updateTitle, true);

		// ********************* Language test

		var langtest = K.create({
			k_class: "NavButtonView",
			width: 50,
			bottom:10,
			right: 10,
			k_children: [{
				k_class: "NavButtonLabel",
				text: "lang"
			}],
			k_click: function(e){
				C.state.lang = (C.state.lang == "en" ? "sv" : "en");
				C.state.currentTitle = C.content.getText(C.state.currentPage.ViewId+"_title");
				pb.pub("/updatetext");
			}
		});
		win.add(langtest);


		// ******************* Navigation logic
		
		pb.sub("/navto",function(pageid,args){
			if (!pages[pageid]){
				throw "WTF, couldn't find "+pageid+" in tree!";
			}
			var lastpage = pages[C.state.currentPageId],
				topage = pages[pageid];
			Ti.API.log(["Navigation",lastpage,topage]);
			// navigation controls
			if (!topage.back){
				if (lastpage && lastpage.back){ // left back, have to hide it
					backbtn.animate({top: -10});
				}
			} else {
				backbtn.animate({top: 10});
				// TODO set the backbutton text too
			}
			if (!topage.listid){
				Ti.API.log(["NO LIST HERE, DID LAST PAGE HAVE?",lastpage,lastpage && lastpage.listid]);
				if (lastpage && lastpage.listid){ // left list, have to hide it
					listbtns.forEach(function(l){
						l.animate({right: -60});
					});
					listmarker.animate({right:-80});
				}
			} else {
				listmarker.right = 0;
				var list = lists[topage.listid];
				Ti.API.log(["LIST!",topage.listplace,list]);
				if (!lastpage || (lastpage.listid != topage.listid)){ // set the new list
					listmarker.top = 60 + topage.listplace * 40;
					listmarker.animate({right:0});
					listbtns.forEach(function(btn,i){
						if (i<list.length){
							btn.animate({right: 10});
							// TODO - set btn text too!
						} else {
							btn.animate({right: -60});
						}
					});
				} else { // moving in same list
					listmarker.animate({top:60+topage.listplace*40});
				}
			}
			// animation stuff
			if (!lastpage || (lastpage && lastpage.tabnr != topage.tabnr)){
				tabmarker.animate({left:30+topage.tabnr*60});
			}
			if (lastpage){
				lastpage.view.animate({opacity:0});
			}
			topage.view.animate({opacity:1});
			// render stuff
			if (topage.view.render){
				topage.view.render(args);
			}
			C.state.currentPageId = pageid;
			C.state.currentBack = topage.back;
			C.state.currentList = list;
		});

		// ******************** Start logic

		pb.sub("/appstart",function(){
			pb.pub("/navto",tabs[0].rootpageid);
		});

        // ******************* All done, returning the window!
        return win;

    }

    // expose
    C.ui = {
        createHeadedList: createHeadedList,
        createContainer: createContainer,
        createRoot: createRoot,
        createPage: createPage,
        createFilmStrip: createFilmStrip,
        createLabel: createLabel,
        createList: createList,
		createAppWindow: createAppWindow
    };

})();

Ti.include("/cognitus/ui/styles.js");

Ti.include("/cognitus/ui/applicationWindow.js");

Ti.include("/cognitus/ui/tab-skills.js");
Ti.include("/cognitus/ui/aboutmodules.js");
Ti.include("/cognitus/ui/modulelist.js");

Ti.include("/cognitus/ui/skillsView.js");
Ti.include("/cognitus/ui/crisisView.js");
Ti.include("/cognitus/ui/skillmodules.js");
Ti.include("/cognitus/ui/skillmodule.js");
