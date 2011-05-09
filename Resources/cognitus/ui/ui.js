(function() {

    function createPage(o) {
		delete o.backgroundColor; // TODO - remove in respective file!
        var view = K.create(K.merge({
            k_type: "View"
            //, width: $$.platformWidth
        },
        o));
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
			k_children: [{
				k_type: "View",
				height: 1,
				top: 0,
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
		
		// tab stuff
		
		var tabrows = [], rowbigheight = 40, rowdefaultheight = 25, rowheight, btnwidth = 90, firstrowbtnwidth = 68, btnspace = 10;
		Ti.App.Properties.setInt("tabrowheight",Ti.App.Properties.getInt("tabrowheight") || rowbigheight);
		rowheight = Ti.App.Properties.getInt("tabrowheight");
		[0,1,2,3].forEach(function(row){
			var tabrow = K.create({
				k_type: "View",
				height: rowheight,
				backgroundColor: ["#AAA","#BBB","#CCC","#DDD"][row],
				bottom: row*rowheight,
				k_children: [{
					k_type: "View",
					height: 1,
					top: 0,
					backgroundColor: "#000"
				}]
			});
			var buttons = [];
			[0,1,2,3].forEach(function(col){
				var btn = K.create({
					k_type: "View",
					k_style: "NavButtonView",
					k_id: "button",
					k_children: [{
						k_type: "View",
						borderSize: 1,
						borderColor: "#000",
						width: 1,
						left: 0
					},{
						k_type: "View",
						borderSize: 1,
						borderColor: "#000",
						width: 1,
						right: 0
					},{
						k_type: "View",
						borderSize: 1,
						borderColor: "#000",
						height: 1,
						bottom: 0
					},{
						k_id: "label",
						k_type: "Label",
						height: rowheight - 5,
						width: row ? btnwidth : firstrowbtnwidth
					}],
					height: rowheight - 5,
					width: row ? btnwidth : firstrowbtnwidth,
					top: 0,
					left: btnspace+((row ? btnwidth : firstrowbtnwidth)+btnspace)*col + 15*((row)%2),
					k_click: function(e){
						pb.pub("/navto", btn.navto );
					}
				});
				buttons.push(btn);
				tabrow.add(btn);
			});
			tabrow.buttons = buttons;
			tabrows.push(tabrow);
			win.add(tabrow);
		});
		
		var anchor = createButton({
			zIndex: 100,
			height: 30,
			width: 30,
			right: 5,
			top: 5,
			title: "↓",
			k_click: function(e){
				updateAnchor(true);
			}
		});
		
		win.add(anchor);
		
		var showingtabs = true;
		function updateAnchor(toggle){
			var dur = 300, prev = showingtabs;
			showingtabs = toggle? !showingtabs : showingtabs;
			if (!showingtabs){
				anchor.title = "↓";
				tabrows.forEach(function(tabrow){
					tabrow.bottom = -Ti.App.Properties.getInt("tabrowheight");
				});
				controlpanel.top = -50;
				frame.top = 0;
				frame.bottom = 0;
			} else {
				anchor.title = "↑";
				tabrows.forEach(function(tabrow,i){
					if (tabrow.showing){
						tabrow.bottom = i*Ti.App.Properties.getInt("tabrowheight");
					}
				});
				controlpanel.top = 0;
				frame.top = 40;
				frame.bottom = Ti.App.Properties.getInt("tabrowheight");
			}
		}
		
		function updateTabs(page){
			var bgcolours = ["#777","#999","#BBB","#DDD","#FFF"],
				numrows = page.listhistory.length;
			//Ti.API.log(["going to show these tabs",page.listhistory,"with these positions",page.listpositions]);
			tabrows.forEach(function(tabrow,i){
				if (i < page.listhistory.length){ // this level is shown!
					var list = lists[page.listhistory[i]];
					//Ti.API.log("Tabrow "+i+" set to listid "+page.listhistory[i]+", which has "+list.length+" tabs");
					tabrow.listid = page.listhistory[i];
					if (tabrow.showing){
						tabrow.bottom = i*Ti.App.Properties.getInt("tabrowheight");
					}
					tabrow.backgroundColor = (i === 0 ? "transparent" : bgcolours[bgcolours.length - numrows - 1 + i]);
					tabrow.showing = 1;
					tabrow.buttons.forEach(function(btn,j){
						var label = btn.k_children.label;
						if (j<list.length && list[j]){
							btn.visible = true;
							label.text = C.content.getText(list[j].navtextid)+list[j].suffix;
							btn.navto = list[j].navto;
							if (j==page.listpositions[i]){
								label.font = {
									fontWeight: "bold",
									fontSize: 10
								};
								btn.backgroundColor = bgcolours[bgcolours.length - numrows + i];
								btn.top = 0;
							} else {
								label.font = {
									fontWeight: "normal",
									fontSize: 10
								};
								btn.top = 1;
								btn.backgroundColor = bgcolours[bgcolours.length - numrows - 1 + i];
							}
						} else {
							btn.visible = false;
						}
					});
				} else { // hide the tabrow;
					tabrow.listid = -1;
					tabrow.bottom = -rowbigheight;
					tabrow.showing = 0;
				}
			});
		}

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
			top:0,
			height:30
			
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
            left: 5,
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
            left: 40,
			title: "→",
			k_click: goForward
        });
		controlpanel.add(forwardbtn);

		// ********************* Notes btn
		
		var notesbtn = createNavButton({
			width: 50,
			top: 5,
			left: 95,
			title: "size",
			k_click: function(){
				var currenth = Ti.App.Properties.getInt("tabrowheight"),
					newh = (currenth===rowdefaultheight?rowbigheight:rowdefaultheight);
				Ti.API.log("going from rowheight "+currenth+" to "+newh);
				Ti.App.Properties.setInt("tabrowheight",newh);
				frame.bottom = newh;
				tabrows.forEach(function(r,i){
					if (r.showing){
						r.bottom = i * newh;
					}
					r.height = newh;
					r.buttons.forEach(function(b,j){
						b.height = newh - 5;
						b.k_children.label.height = newh - 5;
					});
				});
			}
		});
		controlpanel.add(notesbtn);

		// ********************* Language test

		var langtest = createNavButton({
			width: 50,
			top: 5,
			left: 150,
			title: "lang",
			k_click: function(e){
				var lang = C.state.lang;
				C.state.lang = (lang == "en" ? "sv" : lang == "sv" ? "textid" : "en");
				C.state.currentTitle = C.content.getText(C.state.currentPageId+"_title");
				pb.pub("/updatetext");
			}
		});
		controlpanel.add(langtest);

		// ******************* Basic text view
		
		var textview = (function(){
			var view = C.ui.createPage({
				backgroundColor: "red",
				visible: false
			});
			var webview = C.ui.createWebView({top:30});
			view.add(webview);
			view.render = function(argstouse,topage){
				Ti.API.log(["Updating web view",argstouse,topage]);
				var id = (topage.using === "module" ? topage.pageid+"_"+argstouse.ModuleId :
						  topage.using === "skill" ? topage.pageid+"_"+argstouse.SkillId : topage.pageid) + "_html";
				C.ui.updateWebView(webview,C.content.getText(id));
			};
			return view;
		})();
		frame.add(textview);

		// ******************* Stuff

		pb.sub("/updatetext",function(){
			if (C.state.currentPageView.render){
				C.state.currentPageView.render(C.state.lastArgs,C.state.currentPage);
			}
			updateTabs(C.state.currentPage);
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
			
			
			updateTabs(topage);
			
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
			updateAnchor();
			// skill crisis list btn
			if (topage.using === "skill"){
				crisislistitembutton.visible = true;
				crisislistitembutton.title = (C.content.testIfSkillOnCrisisList(args.SkillId) ? "-" : "+");
			}
			if (topage.using !== "skill"){
				crisislistitembutton.visible = false;
			}
		});

		// ******************** Crisis list item button
		var crisislistitembutton = createButton({
			top: 50,
			right: 5,
			height: 30,
			width: 30,
			visible: 0,
			zIndex: 5,
			k_click: function(e){
				//showCrisisListItemPanel(C.state.lastArgs.SkillId,false);
				pb.pub("/showcrisislistitempanel",C.state.lastArgs.SkillId,false);
			},
			title: "+"
		});
		frame.add(crisislistitembutton);
		pb.sub("/hidcrisislistitempanel",function(){
			crisislistitembutton.title = (C.content.testIfSkillOnCrisisList(C.state.lastArgs.SkillId) ? "-" : "+");
		});
		
		
		Ti.include("/cognitus/ui/skillistitempanel.js");
		win.add(C.ui.createSkillListItemPanel());
		

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

Ti.include("/cognitus/ui/styles.js");
Ti.include("/cognitus/ui/tab-skills.js");
Ti.include("/cognitus/ui/modulelist.js");
Ti.include("/cognitus/ui/moduleskillist.js");
Ti.include("/cognitus/ui/moduletrainsession.js");
Ti.include("/cognitus/ui/moduletrainhistory.js");
Ti.include("/cognitus/ui/mycrisisskillist.js");

Ti.include("/cognitus/ui/newslist.js");
Ti.include("/cognitus/ui/newsitem.js");

Ti.include("/cognitus/ui/mylists.js");
Ti.include("/cognitus/ui/skillist.js");