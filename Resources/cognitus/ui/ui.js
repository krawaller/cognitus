(function() {

    function createPage(o) {
		delete o.backgroundColor;
        var view = K.create(K.merge({
            k_type: "View",
            //width: $$.platformWidth
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
                    processContent(page, tabnr, o.back, o.listid, i);
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
            orientationModes: [
				Titanium.UI.PORTRAIT,
				Titanium.UI.UPSIDE_PORTRAIT,
				Titanium.UI.LANDSCAPE_LEFT,
				Titanium.UI.LANDSCAPE_RIGHT
			],
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
                    text: "FOO",
					font: {
						fontSize: 10
					}
                }],
                k_click: function(e) {
					pb.pub("/navto", !tabs[i].lastpageid || (C.state.currentPageId === tabs[i].lastpageid) ? tabs[i].rootpageid : tabs[i].lastpageid);
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
			hidetop: -60,
			showtop: 0,
            right: 0,
            k_children: [{
                k_class: "NavButtonLabel",
                text: "FOOBAR",
				font: {
					fontSize: 10
				}
            }],
            k_click: function(e) {
                pb.pub("/navto", C.state.currentBack.pageid);
            }
        });
		var updatebackbtn = function(pageid){
			var topage = ((pages[((pageid) || (C.state.currentPageId))])||{}),
				back = topage.back;
			if (back){				
				backbtn.k_children[0].text = C.content.getText(back.navtextid ? back.navtextid : back.pageid + "_backnav");
			}
		};
		pb.sub("/updatetext",updatebackbtn);

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
                        text: "FOOBAR",
						font: {
							fontSize: 10
						}
                    }],
                    k_click: function(e) {
                        pb.pub("/navto", C.state.currentList[i].pageid);
                    }
                });
				win.add(listbtns[i]);
            })(i);
        }
		var updatelistbtntexts = function(pageid){
			var topage = ((pages[((pageid) || (C.state.currentPageId))])||{}),
				list = lists[topage.listid];
			if (list){
				listbtns.forEach(function(b,i){
					updatelistbtntext(b,list,i);
				});
			}
		};
		var updatelistbtntext = function(btn,list,pos){
			var def = list[pos];
			if (pos<list.length){
				btn.k_children[0].text = C.content.getText(def.navtext ? def.navtext : def.pageid + "_nav");
			}
		};
		pb.sub("/updatetext",updatelistbtntexts);

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
			if (C.state.currentPage.render){
				C.state.currentPage.render(C.state.lastArgs);
			}
		});

		// ******************* Navigation logic
		
		pb.sub("/navto",function(pageid,args){
			if (!pages[pageid]){
				throw "WTF, couldn't find "+pageid+" in tree!";
			}
			var lastpage = pages[C.state.currentPageId],
				topage = pages[pageid];
			// backbtn
			if (!topage.back){
				if (lastpage && lastpage.back){ // left back, have to hide it
					backbtn.animate({top: backbtn.hidetop});
				}
			} else if ((!lastpage) || (!lastpage.back)) { // no previous back, just show this one
				updatebackbtn(pageid);
				backbtn.animate({top: backbtn.showtop});
			} else if (lastpage.back.pageid != topage.back.pageid) { // new back, have to hide change show
				backbtn.animate({top: backbtn.hidetop},function(){
					updatebackbtn(pageid);
					backbtn.animate({top: backbtn.showtop});
				});
			}
			// list
			if (!topage.listid){
				if (lastpage && lastpage.listid){ // left list, have to hide it
					listbtns.forEach(function(l){
						l.animate({right: -60});
					});
					listmarker.animate({right:-80});
				}
			} else {
				var list = lists[topage.listid];
				if (!lastpage || !lastpage.listid){ // no previous list, just add the new one
					listmarker.top = 60 + topage.listplace * 40;
					listmarker.animate({right:0});
					listbtns.forEach(function(btn,i){
						if (i<list.length){
							btn.animate({right: 10});
							updatelistbtntext(btn,list,i);
						} /* else {
							btn.animate({right: -60});
						}*/
					});					
				} else if (lastpage.listid != topage.listid){ // changing to a new list
					listmarker.animate({right:-70},function(){
						listmarker.top = 60 + topage.listplace * 40;
						listmarker.animate({right:0});
					});
					listbtns.forEach(function(btn,i){
						if (i<list.length){
							btn.animate({right: -60},function(){
								updatelistbtntext(btn,list,i);
								btn.animate({right:10});
							});
						} else {
							btn.animate({right: -60});
						}
					});
				} else { // moving in same list, so just adjust the marker
					listmarker.animate({top:60+topage.listplace*40});
				}
			}
			// tab stuff
			if (!lastpage || (lastpage && lastpage.tabnr != topage.tabnr)){
				tabmarker.animate({left:30+topage.tabnr*60});
			}
			tabs[topage.tabnr].lastpageid = pageid;
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
			C.state.currentPage = topage.view;
			C.state.currentTitle = C.content.getText(pageid+"_title");
			updateTitle();
			C.state.currentPageId = pageid;
			C.state.currentBack = topage.back;
			C.state.currentList = list;
			C.state.lastArgs = argstouse;
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
