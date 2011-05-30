(function() {

    function createPage(o) {
		o = K.merge({
			k_type:"View",
			backgroundColor: "#FFF"
		},o||{});
		var view = K.create(o);
        return view;
    }
	
	var webviewmaster = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory+"/cognitus/html/master.html").read().text;
	function updateWebView(w,html){
		w.html = webviewmaster.replace(/XXXCONTENTXXX/,html);
	}
	function createWebView(o){
		var webview = Ti.UI.createWebView(K.merge({
			backgroundColor: "#FFF"
		},o||{}));
		return webview;
	}

    function createLabel(id, o) {
        var label = K.create(K.merge(o || {},{
            k_type: "Label",
			textAlign: "left",
			verticalAlign: "top",
			left: 10,
			k_class: "textLabel"
        }));
        C.content.setObjectText(label, id);
        return label;
    }

	function createNavButton(o){
		return createButton(o);
	}

	function createButton(o){
		var btn = K.create(K.merge(o||{},{
			k_type: "Button",
			font: {
				fontSize: 11
			},
			height: 30
		}));
		if (o.textid){
			C.content.setObjectText(btn,o.textid,"title");
		}
		return btn;
	}

	function showMessage(textid,type){
		alert(C.content.getText(textid));
	}

    function createAppWindow(appstructure) {
		var newlistid = (function(){
			var max = 0;
			return function(){
				return max++;
			};
		})();

        // ****************** Building the app structure from the tree
        function processContent(o, lists, pages, listid, listhistory, listpositions, level) {
            if (Array.isArray(o)) {
                // processing a List
                lists[listid] = [];
                o.forEach(function(page,i) {
                    lists[listid].push({
                        navtextid: (page.navtextid) || (page.pageid+"_nav"),
						suffix: page.sub ? !page.view ? " ↑" : " •" : "",
                        navto: (page.navto) || (page.pageid),
						level: level
                    });
					processContent(page, lists, pages, listid, [].concat(listhistory).concat(listid), [].concat(listpositions).concat([i]), level);
                });
            } else {
                // processing a Page
				if (!o.navto){
                	pages[o.pageid] = {
                    	view: o.view,
						listid: listid,
                    	listhistory: [].concat(listhistory), // must be copy
						listpositions: [].concat(listpositions), // copy
						listhistorystring: [].concat(listhistory).join(","),
						level: level,
						using: (o.using) || (""),
						pageid: o.pageid,
						basic: !o.view
                	};
				}
                if (o.sub) {
                    processContent(o.sub, lists, pages, newlistid(), listhistory, listpositions, level+1);
                }
            }
        }
        var lists = {},
        	pages = {};
		processContent(appstructure,lists,pages,newlistid(),[], [], 1);


        // ***************** Creating the window object and adding the pages
        var win = K.create({
            k_type: "Window",
            exitOnClose: true,
            orientationModes: [
				Titanium.UI.PORTRAIT,
				Titanium.UI.UPSIDE_PORTRAIT,
				Titanium.UI.LANDSCAPE_LEFT,
				Titanium.UI.LANDSCAPE_RIGHT
			],
            fullscreen: true,
			backgroundColor: "red"
        });
		var swipedir;
		var frame = K.create({
			k_type: "View",
			top: 40,
			bottom: 40,
			backgroundColor: "#FFF",
			zIndex: 2,
			k_children: [{
				k_type: "View",
				height: 1,
				top: 0,
				backgroundColor: "#000"
			},{
				k_type: "View",
				width: 1,
				left: 0,
				backgroundColor: "#000"
			}],
			k_events: {
				doubletap: function(e){
					updateAnchor(true);
				},
				swipe: function(e){
					swipedir = e.direction;
				},
				touchend: function(e){
					if (swipedir){
						if (swipedir === "left"){
							goBack();
						} else {
							goForward();
						}
						swipedir = false;
					}
				}
			}
		});
		win.add(frame);

        for (var pid in pages) {
            var page = pages[pid];
			if (page.view){
            	page.view.visible = false;
            	frame.add(page.view);
			}
        }
		C.state.frame = frame;

		// controls
		
		var anchor = createButton({
			zIndex: 100,
			height: 30,
			width: 30,
			left: 5,
			top: 5,
			title: "↓",
			k_click: function(e){
				C.state.showingTabs = !C.state.showingTabs;
				anchor.title = C.state.showingTabs ? "↑" : "↓";
				pb.pub("/adjustframe");
			}
		});
		
		win.add(anchor);


        // ****************** Title bits
        var titleview = K.create({
            k_type: "View",
            height: 35,
            top: 5,
            width: 200,
            left: 50,
            borderWidth: 1,
			zIndex: 5,
            borderColor: "#000",
            backgroundColor: "#CCC",
            k_children: [,{
				k_id: "supertitle",
				k_type: "Label",
				font: {fontSize:10},
				top: 0
			},{
				top: 12,
				k_type: "Label",
				k_id: "maintitle",
                font: {fontSize:14,fontWeight:"bold"}
            }]
        });
        frame.add(titleview);

		function setTitle(main,sup){
			titleview.k_children.maintitle.text = main;
			titleview.k_children.supertitle.text = sup;
			titleview.k_children.maintitle.top = (sup ? 12 : 7);
		}
		
        function updateTitle(pagedef,args) {
			if (!pagedef){
				pagedef = C.state.currentPage;
				args = C.state.lastArgs;
			}
			var main, sup = "";
			switch(pagedef.using){
				case "news":
					main = C.content.getText(args.NewsId +"_headline");
					sup =  C.content.getNewsItem(args.NewsId).date;
					break;
				case "module":
					sup = C.content.getText("module_"+args.ModuleId+"_title");
					main = C.content.getText(pagedef.pageid +"_title");
					break;
				case "skill":
					sup = C.content.getText("skill_"+args.SkillId+"_title");
					main = C.content.getText(pagedef.pageid +"_title");
					break;
				case "list":
					main = C.content.getListTitle(args.ListId);
					sup = C.content.getText("skillist_supertitle");
					break;
				default:
					main = C.content.getText(  pagedef.pageid +"_title");
			}
			setTitle(main,sup);
        }
        pb.sub("/updatetext", updateTitle);
        pb.sub("/updatetitle", setTitle);
		win.showPageTitle = function(){titleview.visible = true;};
		win.hidePageTitle = function(){titleview.visible = false;};


		var controlpanel = K.create({
			k_type: "View",
			width: Ti.Platform.displayCaps.platformWidth,
			top: 0
		});
		win.add(controlpanel);

		// ********************* Backbtn
		function goBack(){
			if (C.state.historyposition>0){
				var to = C.state.history[--C.state.historyposition];
				pb.pub("/navto",to.pageid,K.merge({dontadjusthistory:true},to.args));
			}
		}
		var backbtn = createNavButton({
            height: 30,
            top: 5,
            width: 30,
            left: 50,
			title: "←",
			k_click: goBack
        });
		controlpanel.add(backbtn);
		
		// ********************* Forwardbutton
		function goForward(){
			if (C.state.historyposition < C.state.history.length-1){
				var to = C.state.history[++C.state.historyposition];
				pb.pub("/navto",to.pageid,K.merge({dontadjusthistory:true},to.args));
			}
		}
		var forwardbtn = createNavButton({
            height: 30,
            top: 5,
            width: 30,
            left: 90,
			title: "→",
			k_click: goForward
        });
		controlpanel.add(forwardbtn);

		// ********************* Size btn
		
		var sizebtn = createNavButton({
			width: 50,
			top: 5,
			left: 130,
			title: "size",
			k_click: function(){
				var rowdefaultheight = 25, rowbigheight = 40;
				var currenth = Ti.App.Properties.getInt("tabrowheight"),
					newh = (currenth===rowdefaultheight?rowbigheight:rowdefaultheight);
				Ti.App.Properties.setInt("tabrowheight",newh);
				pb.pub("/settabrowheight",newh);
				pb.pub("/adjustframe");
			}
		});
		controlpanel.add(sizebtn);

		// ********************* Language test

		var langtest = createNavButton({
			width: 50,
			top: 5,
			left: 210,
			title: "lang",
			k_click: function(e){
				var lang = C.state.lang;
				C.state.lang = (lang == "en" ? "sv" : lang == "sv" ? "textid" : "en");
				C.state.currentTitle = C.content.getText(C.state.currentPageId+"_title");
				pb.pub("/updatetext");
			}
		});
		controlpanel.add(langtest);


		// ******************* Tabs
		Ti.include("/cognitus/ui/tabstructure2.js"); // <------ OBSERVE! choise of tabstructure file
		win.add(C.ui.createTabStructure(lists,pages));


		// ******************* Basic text view
		
		var textview = (function(){
			var view = C.ui.createPage({
				backgroundColor: "red",
				visible: false
			});
			var webview = C.ui.createWebView({top:30});
			view.add(webview);
			view.render = function(argstouse,topage){
				//Ti.API.log(["Updating web view",argstouse,topage]);
				var id = (topage.using === "module" ? topage.pageid+"_"+argstouse.ModuleId :
						  topage.using === "skill" ? topage.pageid+"_"+argstouse.SkillId : topage.pageid) + "_html";
				C.ui.updateWebView(webview,C.content.getText(id));
			};
			return view;
		})();
		frame.add(textview);


		// ******************* Frame adjustment
		
		Ti.Gesture.addEventListener('orientationchange', function(e){
			pb.pub("/adjustframe");
		});
		
		pb.sub("/adjustframe",function(){
			if (C.state.showingTabs){
				var tabheight = C.state.currentPage.listhistory.length * Ti.App.Properties.getInt("tabrowheight");
				if (C.state.orientation === "landscape"){
					frame.bottom = 0;
					frame.right = tabheight;
					frame.left = 40;
					frame.top = 0;
					controlpanel.transform = Ti.UI.create2DMatrix({rotate:-90});
					//controlpanel.width = Ti.Platform.displayCaps.platformHeight;
					controlpanel.bottom = 0;
					controlpanel.left = 0;
				} else {
					frame.top = 40;
					frame.left = 0;
					frame.right = 0;
					frame.bottom = tabheight;
					controlpanel.transform = Ti.UI.create2DMatrix({rotate:0});
					//controlpanel.width = Ti.Platform.displayCaps.platformWidth;
					controlpanel.bottom = undefined;
					controlpanel.left = undefined;
					//controlpanel.top = 0;
				}
			} else {
				frame.right = 0;
				frame.left = 0;
				frame.top = 0;
				frame.bottom = 0;
			}
		});



		// ******************* Stuff

		pb.sub("/updatetext",function(){
			if (C.state.currentPageView.render){
				C.state.currentPageView.render(C.state.lastArgs,C.state.currentPage);
			}
		});

		// ******************* Navigation logic
		
		pb.sub("/navto",function(pageid,args){
			titleview.visible = true;
			args = args || {};
			if (!pages[pageid]){
				throw "WTF, couldn't find "+pageid+" in tree!";
			}
			var lastpage = pages[C.state.currentPageId],
				topage = pages[pageid],
				historymax = 25;
			// HISTORY
			
			if (!args.dontadjusthistory && !(lastpage && topage.view === lastpage.view)){
				C.state.historyposition++;
				C.state.history.splice(C.state.historyposition);
				C.state.history.push({pageid:pageid,args:args});
			}
			delete args.dontadjusthistory;
			backbtn.opacity = C.state.historyposition ? 1 : 0.5;
			forwardbtn.opacity = C.state.historyposition < C.state.history.length - 1 ? 1 : 0.5;
			if (C.state.history.length>historymax){
				C.state.history = C.state.history.splice(C.state.history.length-historymax);
				C.state.historyposition = C.state.history.length - 1; // since we'll only truncate after normal move, thus we're at the front!
			}
			
			// textview
			if (topage.basic){
				topage.view = textview;
			}
			
			// animation
			if (lastpage && topage.view !== lastpage.view){
				lastpage.view.visible = false;
				topage.view.visible = true;
			} else {
				topage.view.visible = true;
			}
			// render stuff
			
			C.state.lastArgs && delete C.state.lastArgs.addSkillId;
			
			var argstouse = K.merge(args || {},C.state.lastArgs || {});
			if (argstouse.SkillId && !argstouse.ModuleId){
				argstouse.ModuleId = C.content.getModuleForSkill(argstouse.SkillId);
			}
			if (topage.view.render){
				topage.view.render(argstouse,topage);
			}
			C.state.currentPageView = topage.view;
			C.state.currentPage = topage;
			C.state.currentTitle = C.content.getText(pageid+"_title");
			updateTitle(topage,args);
			C.state.currentPageId = pageid;
			C.state.currentBack = topage.back;
			C.state.lastArgs = argstouse;
			
			pb.pub("/updatetabs",pageid);
			pb.pub("/adjustframe");
			
			// skill crisis list btn
			if (topage.using === "skill"){
				listitembutton.visible = true;
				//listitembutton.title = (C.content.testIfSkillOnCrisisList(args.SkillId) ? "-" : "+");
			}
			if (topage.using !== "skill"){
				listitembutton.visible = false;
			}
		});

		// ******************** Add skill to list button
		var listitembutton = createButton({
			top: 50,
			right: 5,
			height: 30,
			width: 30,
			visible: 0,
			zIndex: 5,
			k_click: function(e){
				pb.pub("/showselectlistmodal",C.content.getListsIncludingSkill(C.state.lastArgs.SkillId),function(listid){
					pb.pub("/navto","skillist",{ListId: listid, addSkillId: C.state.lastArgs.SkillId});
				});
			},
			title: "+"
		});
		frame.add(listitembutton);

		
		// ********************* Skill selection panel logic *********************
		Ti.include("/cognitus/ui/selectskillmodal.js");
		var selectskillmodal = C.ui.createSelectSkillModal();
		win.add(selectskillmodal);
		
		// ********************* List selection panel logic *********************
		Ti.include("/cognitus/ui/selectlistmodal.js");
		var selectlistmodal = C.ui.createSelectListModal();
		win.add(selectlistmodal);
		
		
		

		// ******************** Start logic

		pb.sub("/appstart",function(){
			pb.pub("/navto","home"); // TODO - fix dynamically!
		});

        // ******************* All done, returning the window!
        return win;

    }

    // expose
    C.ui = {
		showMessage: showMessage,
		createWebView: createWebView,
		updateWebView: updateWebView,
        createPage: createPage,
        createLabel: createLabel,
		createAppWindow: createAppWindow,
		createButton: createButton,
		showPageTitle: function(){C.state.mainWindow.showPageTitle();},
		hidePageTitle: function(){C.state.mainWindow.hidePageTitle();},
		setPageTitle: function(main,sup){C.state.mainWindow.setPageTitle(main,sup);}
    };

})();

Ti.include(
	"/cognitus/ui/styles.js",
	"/cognitus/ui/tab-skills.js",
	"/cognitus/ui/modulelist.js",
	"/cognitus/ui/moduleskillist.js",
	"/cognitus/ui/moduletrainsession.js",
	"/cognitus/ui/moduletrainhistory.js",
	"/cognitus/ui/crisis.js",
	"/cognitus/ui/newslist.js",
	"/cognitus/ui/newsitem.js",
	"/cognitus/ui/mylists.js",
	"/cognitus/ui/skillist.js",
	"/cognitus/ui/skilltable.js"
);