(function() {

	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});

    function createPage(o) {
		o = K.merge({
			k_type:"ScrollView",
			backgroundColor: "#FFF",
			contentHeight:'auto',
			showVerticalScrollIndicator:true
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
					Ti.API.log(["ok!",textfield.hintText,textfield.toolbarTitle,(textfield.hintText || textfield.toolbarTitle || "XXX")]);
					toolbartitle.text = (textfield.hintText || textfield.toolbarTitle || "");
				}
			}
		}));
		return textfield;
	}
	
	function createTableSectionHeader(text){
		var header = K.create({
			k_type: "View",
			k_class: "tableheaderview"
		});
		header.add(createLabel(undefined,{
			text: text,
			k_class: "tableheaderlabel"
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
		createTextArea: createTextArea
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