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
	function createWebView(){
		var webview = Ti.UI.createWebView({});
		return webview;
	}

    function createLabel(id, o) {
        var label = K.create(K.merge({
            k_type: "Label"
        },
        o || {}));
        C.content.setObjectText(label, id);
        return label;
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
                        navtextid: (page.navtextid) || (page.pageid+"_title"),
                        navto: (page.navto) || (page.pageid),
						level: level
                    });
					processContent(page, lists, pages, listid, [].concat(listhistory).concat(listid), [].concat(listpositions).concat([i]), level);
                });
            } else {
                // processing a Page
				if (o.view){
                	pages[o.pageid] = {
                    	view: o.view,
						listid: listid,
                    	listhistory: [].concat(listhistory), // must be copy
						listpositions: [].concat(listpositions), // copy
						listhistorystring: [].concat(listhistory).join(","),
						level: level
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
			}]
		});
		win.add(frame);

        for (var pid in pages) {
            var page = pages[pid];
            page.view.opacity = 0;
            frame.add(page.view);
        }
		
		// tab stuff
		
		var tabrows = [], rowheight = 25, btnwidth = 90, btnspace = 10;
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
						k_style: "NavButtonLabel",
						k_id: "label",
						k_type: "Label",
						height: rowheight - 5,
						width: btnwidth
					}],
					height: rowheight - 5,
					width: btnwidth,
					top: 0,
					left: btnspace+(btnwidth+btnspace)*col + 15*((row+1)%2),
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
		
		var anchor = K.create({
			k_type: "View",
			k_style: "NavButtonView",
			borderSize: 1,
			borderColor: "#000",
			backgroundColor: "#777",
			height: 30,
			width: 30,
			right: 5,
			top: 5,
			k_children: [{
				k_style: "NavButtonLabel",
				k_id: "label",
				text: "↓"
			}],
			k_click: function(e){
				updateAnchor(true);
			}
		});
		
		win.add(anchor);
		
		var showing = true;
		function updateAnchor(toggle){
			var dur = 300, prev = showing;
			showing = toggle? !showing : showing;
			if (!showing){
				tabrows.forEach(function(tabrow){
					tabrow.animate({bottom: -rowheight, duration: dur});
				});
				anchor.k_children.label.text = "↑";
				backbtn.animate({top: -50});
				langtest.animate({top:-50});
				notesbtn.animate({top:-50});
				frame.animate({top:0,bottom:0});
			} else {
				tabrows.forEach(function(tabrow,i){
					if (tabrow.showing){
						tabrow.animate({bottom: i*rowheight, duration: dur});
					}
				});
				anchor.k_children.label.text = "↓";
				backbtn.animate({top: 5});
				langtest.animate({top:5});
				notesbtn.animate({top:5});
				frame.animate({top:40,bottom:40});
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
					if (showing){
						tabrow.bottom = i*rowheight;
					}
					tabrow.backgroundColor = (i === 0 ? "transparent" : bgcolours[bgcolours.length - numrows - 1 + i]);
					tabrow.showing = 1;
					tabrow.buttons.forEach(function(btn,j){
						var label = btn.k_children.label;
						if (j<list.length && list[j]){
							btn.opacity = 1;
							label.text = C.content.getText(list[j].navtextid);
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
							btn.opacity = 0;
						}
					});
				} else { // hide the tabrow;
					tabrow.listid = -1;
					tabrow.bottom = -rowheight;
					tabrow.showing = 0;
				}
			});
		}

        // ****************** Title bits
        var titleview = K.create({
            k_type: "View",
            height: 30,
            top: 5,
            width: 200,
            left: 50,
            borderWidth: 1,
            borderColor: "#000",
            backgroundColor: "#CCC",
            k_children: [{
                k_class: "TitleLabel"
            }]
        }),
        titlelabel = titleview.k_children[0];
        frame.add(titleview);

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
       // pb.sub("/newtitle", updateTitle);
        pb.sub("/updatetext", updateTitle, true);

		// ********************* Backbtn
		var backbtn = K.create({
            k_type: "View",
            height: 30,
            top: 5,
            width: 30,
            left: 5,
            borderWidth: 1,
            borderColor: "#000",
            backgroundColor: "#CCC",
            k_children: [{
                k_class: "TitleLabel",
				text: "←"
            }],
			k_click: function(e){
				Ti.API.log(C.state.history);
				if (C.state.history.length){
					var to = C.state.history.pop();
					pb.pub("/navto",to.pageid,K.merge({back:true},to.args));
				}
			}
        });
		win.add(backbtn);

		// ********************* Notes btn
		
		var notesbtn = K.create({
			k_class: "NavButtonView",
			width: 50,
			top: 5,
			left: 95,
			k_children: [{
				k_class: "NavButtonLabel",
				text: "notes"
			}]
		});
		win.add(notesbtn);

		// ********************* Language test

		var langtest = K.create({
			k_class: "NavButtonView",
			width: 50,
			top: 5,
			left: 40,
			k_children: [{
				k_class: "NavButtonLabel",
				text: "lang"
			}],
			k_click: function(e){
				var lang = C.state.lang;
				C.state.lang = (lang == "en" ? "sv" : lang == "sv" ? "textid" : "en");
				C.state.currentTitle = C.content.getText(C.state.currentPageId+"_title");
				pb.pub("/updatetext");
			}
		});
		win.add(langtest);

		// ******************* Stuff

		pb.sub("/updatetext",function(){
			if (C.state.currentPageView.render){
				C.state.currentPageView.render(C.state.lastArgs);
			}
			updateTabs(C.state.currentPage);
		});

		// ******************* Navigation logic
		
		pb.sub("/navto",function(pageid,args){
			args = args || {};
			if (!pages[pageid]){
				throw "WTF, couldn't find "+pageid+" in tree!";
			}
			var lastpage = pages[C.state.currentPageId],
				topage = pages[pageid],
				historymax = 5;
			if (C.state.currentPageId && !args.back){
				C.state.history.push({pageid:C.state.currentPageId,args:C.state.lastArgs});
				if (C.state.history.length > historymax){
					//Ti.API.log("SHORTENING HISTORY! was "+C.state.history.length);
					C.state.history = C.state.history.splice(C.state.history.length-historymax);
					//Ti.API.log("SHORTENED HISTORY! Is now "+C.state.history.length);
				}
			}
			updateTabs(topage);
			// animation
			if (lastpage){
				lastpage.view.animate({opacity:0});
			}
			topage.view.animate({opacity:1});
			// render stuff
			var argstouse = K.merge(args || {},C.state.lastArgs || {});
			if (argstouse.SkillId && !argstouse.ModuleId){
				argstouse.ModuleId = C.content.getModuleForSkill(argstouse.SkillId);
			}
			if (topage.view.render){
				topage.view.render(argstouse);
			}
			C.state.currentPageView = topage.view;
			C.state.currentPage = topage;
			C.state.currentTitle = C.content.getText(pageid+"_title");
			updateTitle();
			C.state.currentPageId = pageid;
			C.state.currentBack = topage.back;
			C.state.lastArgs = argstouse;
			updateAnchor();
		});

		// ******************** Start logic

		pb.sub("/appstart",function(){
			pb.pub("/navto","aboutmodules"); // TODO - fix dynamically!
		});

        // ******************* All done, returning the window!
        return win;

    }

    // expose
    C.ui = {
		createWebView: createWebView,
		updateWebView: updateWebView,
        createPage: createPage,
        createLabel: createLabel,
		createAppWindow: createAppWindow
    };

})();

Ti.include("/cognitus/ui/styles.js");

Ti.include("/cognitus/ui/tab-skills.js");
Ti.include("/cognitus/ui/aboutmodules.js");
Ti.include("/cognitus/ui/modulelist.js");
Ti.include("/cognitus/ui/moduleexplanation.js");
Ti.include("/cognitus/ui/moduleskillist.js");
Ti.include("/cognitus/ui/skillexplanation.js");
Ti.include("/cognitus/ui/skillexercises.js");
Ti.include("/cognitus/ui/skillexamples.js");
Ti.include("/cognitus/ui/moduletraininstruction.js");
Ti.include("/cognitus/ui/moduletrainsession.js");
Ti.include("/cognitus/ui/moduletrainhistory.js");

Ti.include("/cognitus/ui/mycrisisskillist.js");
