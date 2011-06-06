(function() {

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

    // expose
    C.ui = {
		showMessage: showMessage,
        createPage: createPage,
        createLabel: createLabel,
		createButton: createButton,
		showPageTitle: function(){C.state.mainWindow.showPageTitle();},
		hidePageTitle: function(){C.state.mainWindow.hidePageTitle();},
		setPageTitle: function(main,sup){C.state.mainWindow.setPageTitle(main,sup);}
    };

})();

Ti.include(
	"/cognitus/ui/appwindow.js",
	"/cognitus/ui/styles.js",
	"/cognitus/ui/tab-skills.js",
	"/cognitus/ui/modulelist.js",
	"/cognitus/ui/moduleskillist.js",
	"/cognitus/ui/moduletrainsession.js",
	"/cognitus/ui/moduletrainhistory.js",
	"/cognitus/ui/crisis.js",
	"/cognitus/ui/newslist.js",
	"/cognitus/ui/mylists.js",
	"/cognitus/ui/skillist.js",
	"/cognitus/ui/skilltable.js",
	"/cognitus/ui/test.js"
);