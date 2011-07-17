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
			top: 5,
			left: 5,
			width: 34,
			height: 34,
			zIndex: 1000,
			backgroundImage: "images/icons/close.png",
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
				height: 34, 
				width: 34, 
				top: 10, 
				right: 10, 
				backgroundImage: "images/icons/information.png",
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
		o = K.merge({
			k_type:"View",//"ScrollView",
			backgroundColor: "#FFF",
			contentHeight:'auto',
			//showVerticalScrollIndicator:o.noscroll?false:true
		},o||{});
		var view = K.create(o);
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
	
	function createTextField(o,area){
		var donebtn = K.create({
			k_class: "keyboardtoolbarbutton",
			title: "!!!",
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
				//o.containingTable && o.containingTable.scrollToIndex(o.rowIndex);
			});
			textfield.addEventListener("blur",function(e){
				//o.containingView && o.containingView.scrollTo(0,0);
				//o.containingTable && o.containingTable.scrollToIndex(0);
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
			selectedBackgroundImage: "images/rowselectedbackground.png",
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
			height: 32,
			backgroundImage: "images/button32.png",
			backgroundLeftCap: 5
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
