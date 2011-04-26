(function() {

    function createPage(o) {
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
                        navtextid: (page.navtextid) || (page.pageid),
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
            fullscreen: true
        });

Ti.API.log(lists);
Ti.API.log(pages);

        for (var pid in pages) {
            var page = pages[pid];
            page.view.opacity = 0;
            win.add(page.view);
        }

		var tabrows = [];
		[0,1,2,3].forEach(function(row){
			var tabrow = K.create({
				k_type: "View",
				height: 30,
				backgroundColor: ["#AAA","#BBB","#CCC","#DDD"][row],
				bottom: row*30
			});
			var buttons = [];
			[0,1,2,3].forEach(function(col){
				var btn = K.create({
					k_type: "View",
					k_style: "NavButtonView",
					k_id: "button",
					k_children: [{
						k_style: "NavButtonLabel",
						k_id: "label",
						text: "FOO"
					}],
					height: 25,
					width: 70,
					left: 10+80*col,
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
		
		function updateTabs(page){
			Ti.API.log(["going to show these tabs",page.listhistory,"with these positions",page.listpositions]);
			tabrows.forEach(function(tabrow,i){
				if (i < page.listhistory.length){ // this level is shown!
					Ti.API.log("Tabrow "+i+" set to "+page.listhistory[i]);
					var list = lists[page.listhistory[i]];
					tabrow.listid = page.listhistory[i];
					tabrow.opacity = 1;
					tabrow.buttons.forEach(function(btn,j){
						var label = btn.k_children.label;
						if (j<list.length && list[j]){
							label.text = list[j].navtextid;
							btn.navto = list[j].navto;
							if (j==page.listpositions[i]){
								label.font = {
									fontWeight: "bold"
								};
							} else {
								label.font = {
									fontWeight: "normal"
								};
							}
						} else {
							btn.opacity = 0;
						}
					});
				} else { // hide the tabrow;
					tabrow.listid = -1;
					tabrow.opacity = 0;
				}
			});
		}

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
       // pb.sub("/newtitle", updateTitle);
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
		});

		// ******************* Navigation logic
		
		pb.sub("/navto",function(pageid,args){
			if (!pages[pageid]){
				throw "WTF, couldn't find "+pageid+" in tree!";
			}
			var lastpage = pages[C.state.currentPageId],
				topage = pages[pageid];
			updateTabs(topage);

			// animation
			if (lastpage){
				lastpage.view.animate({opacity:0});
			}
			topage.view.animate({opacity:1});
			// render stuff
			var argstouse = K.merge(args || {},C.state.lastArgs || {});
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

Ti.include("/cognitus/ui/applicationWindow.js");

Ti.include("/cognitus/ui/tab-skills.js");
Ti.include("/cognitus/ui/aboutmodules.js");
Ti.include("/cognitus/ui/modulelist.js");
Ti.include("/cognitus/ui/moduleexplanation.js");
Ti.include("/cognitus/ui/moduleskillist.js");
Ti.include("/cognitus/ui/skillexplanation.js");
Ti.include("/cognitus/ui/skillexercises.js");
Ti.include("/cognitus/ui/skillexamples.js");

Ti.include("/cognitus/ui/crisisView.js");
