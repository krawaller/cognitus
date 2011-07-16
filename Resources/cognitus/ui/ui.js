(function() {

	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});

	function createModal(o){
		o = o || {};
		var closefun = function(){
			if (o.onClose){
				o.onClose();
			}
			modal.visible = false;
		};
		var showfun = function(arg){
			if (o.onShow){
				o.onShow(arg);
			}
			modal.visible = true;
		};
		var modal = K.create({
			k_class: "modalbackgroundview",
			visible: false,
			k_click: function(e){
				if (e.source === modal){
					closefun();
				}
			},
			zIndex: ((o.zIndex) || (500))
		});
		var panel = K.create({
			k_class: "modalpanelview"
		});
		modal.add(panel);
		var closebtn = C.ui.createButton({
			k_type: "Button",
			top: 10,
			left: 10,
			width: 34,
			height: 34,
			zIndex: 1000,
			image: "images/icons/close.png",
			k_click: closefun
		});
		panel.add(closebtn);
		modal.close = closefun;
		modal.show = showfun;
		modal.panel = panel;
		// helptextid provided?
		if (o.helptextid){
			var helpbtn = C.ui.createButton({
				zIndex: 1000,
				height: 30, width: 30, top: 10, right: 10, image: Ti.Filesystem.resourcesDirectory+"/images/icons/information.png",
				k_click: function(){
					pb.pub("/showhelpmodal",C.content.getText(o.helptextid),true);
				}
			});
			modal.panel.add(helpbtn);
		}
		// finish
		return modal;
	}

    function createPage(o) {
<<<<<<< HEAD
		o = K.merge({
			k_type:"ScrollView",
			backgroundColor: "#FFF",
			contentHeight:'auto',
			showVerticalScrollIndicator:true
		},o||{});
		var view = K.create(o);
=======
		delete o.backgroundColor;
        var view = K.create(K.merge({
            k_type: "View",
            //width: $$.platformWidth
        },
        o));
>>>>>>> 7e5be0f360c943eb13d99f3fb63ddd3df5346180
        return view;
    }
	
	function createTextArea(o){
		return createTextField(o,true);
	}
	
	function createTableView(o){
		var table = K.create(K.merge(o||{},{
			k_type: "TableView"
		}));
		return table;
	}
<<<<<<< HEAD
	
	function createTextField(o,area){
		var donebtn = K.create({
			k_class: "keyboardtoolbarbutton",
			title: "!!!",
=======

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
>>>>>>> 7e5be0f360c943eb13d99f3fb63ddd3df5346180
			k_click: function(e){
				textfield.blur();
			}
		});
		var toolbartitle = K.create({
			k_class: "keyboardtoolbarlabel",
			text: o.hintText || o.toolbarTitle
		});
		var textfield = K.create(K.merge(o||{},{
			k_type: area ? "TextArea" : "TextField",
			keyboardToolbar:[flexSpace,toolbartitle,flexSpace, donebtn],
			k_events: {
				focus: function(e){
					toolbartitle.text = ((textfield.hintText) || (textfield.toolbarTitle) || "");
				}
			}
		}));
		if (o.adjustscroll){
			textfield.addEventListener("focus",function(e){
				o.containingTable && o.containingTable.scrollToIndex(o.rowIndex);
			});
			textfield.addEventListener("blur",function(e){
				o.containingView && o.containingView.scrollTo(0,0);
				o.containingTable && o.containingTable.scrollToIndex(0);
			});
		}
		return textfield;
	}
	
	function createTableSectionHeader(text,heavy){
		var header = K.create({
			k_type: "View",
			k_class: (heavy ? "tableheaderheavyview" : "tableheaderview")
		});
		header.add(createLabel(undefined,{
			text: text,
			k_class: "tableheader"+(heavy?"heavy":"")+"label"
		}));
		return header;
	}
	
	function createTableViewRow(o){
		var row = K.create(K.merge(o||{},{
			k_type: "TableViewRow",
			height: 50
		}));
		if (o.rowtoplabel){
			row.add(createLabel(undefined,{
				k_class: "rowtoplabel",
				text: o.rowtoplabel
			}));
		}
		if (o.rowmainlabel){
			row.add(createLabel(undefined,{
				k_class: "rowmainlabel",
				text: o.rowmainlabel
			}));
		}
		return row;
	}
	
    function createLabel(id,o) {
        var label = K.create(K.merge(o || {},{
            k_type: "Label",
			k_class: "descriptionlabel"
			//,top: 0
        }));
		if (id){
        	C.content.setObjectText(label, id);
		}
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

    // expose
    C.ui = {
		showMessage: showMessage,
        createPage: createPage,
        createLabel: createLabel,
		createButton: createButton,
		createTableView: createTableView,
		createTableViewRow: createTableViewRow,
		createTextField: createTextField,
		createTableSectionHeader: createTableSectionHeader,
		createTextArea: createTextArea,
		createModal: createModal
    };

})();

Ti.include(
	"/cognitus/ui/appwindow.js",
	"/cognitus/ui/styles.js",
	"/cognitus/ui/tab-skills.js",
	"/cognitus/ui/modulelist.js",
	"/cognitus/ui/moduleskillist.js",
	"/cognitus/ui/moduletrainsession.js",
	"/cognitus/ui/moduletrainsessionlist.js",
	"/cognitus/ui/crisis.js",
	"/cognitus/ui/newslist.js",
	"/cognitus/ui/newsitem.js",
	"/cognitus/ui/mylists.js",
	"/cognitus/ui/skillist.js",
	"/cognitus/ui/skilltable.js",
	"/cognitus/ui/test.js"
);
