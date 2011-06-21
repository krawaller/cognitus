C.ui.createAppWindow = function(appstructure) {
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
		opacity: 1,
        fullscreen: true,
		backgroundColor: "transparent"
    });
	win.backgroundColor = "transparent";
	win.backgroundImage = Ti.Filesystem.resourcesDirectory+'/iphone/Default.png';
	//Ti.API.log(Ti.Filesystem.resourcesDirectory+'/iphone/Default.png');
	var swipedir;
	var GRADIENTBREDTH = 30;
	var frame = K.create({
		k_type: "View",
		top: 40,
		bottom: 40,
		opacity: 0.1,
		backgroundColor: "transparent",
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
		},{
			visible: false,
			k_type: "View",
			k_id: "gradientportrait",
			height: GRADIENTBREDTH,
			bottom: 0,
			backgroundGradient: {
				type: 'linear',
				colors: [{
					color: 'transparent',
					position: 0.0
				}, {
					color: '#ffffff',
					position: 1.0
				}]
			}
		},{
			visible: false,
			k_type: "View",
			k_id: "gradientlandscape",
			width: GRADIENTBREDTH,
			right: 0,
			backgroundGradient: {
				type: 'linear',
				colors: [{
					color: 'transparent',
					position: 0.0
				}, {
					color: '#ffffff',
					position: 1.0
				}]
			}
		}],
		k_events: {
			doubletap: toggleControls/*, TODO - decide if we want Back-forward!
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
			} */
		}
	});
	win.add(frame);
	var gradientportrait = frame.k_children.gradientportrait,
		gradientlandscape = frame.k_children.gradientlandscape;

    for (var pid in pages) {
        var page = pages[pid];
		if (page.view){
        	page.view.visible = false;
        	frame.add(page.view);
		}
    }
	C.state.frame = frame;


	// ******************* Basic text view
	
	Ti.include("/cognitus/ui/htmlview.js");
	var textview = C.ui.createHtmlView({});
	frame.add(textview);

	// controls
	
	
	function toggleControls(){
		C.state.showingTabs = !C.state.showingTabs;
		anchor.title = C.state.showingTabs ? "↑" : "↓";
		pb.pub("/adjustframe");
	}
	
	var anchor = C.ui.createButton({
		zIndex: 100,
		height: 30,
		width: 30,
		left: 5,
		top: 5,
		title: "↓",
		k_click: toggleControls
	});
	
	win.add(anchor);

	Ti.include("/cognitus/ui/title.js");
	var titleview = C.ui.createTitleView();
	frame.add(titleview);
	
	win.showPageTitle = function(){titleview.visible = true;};
	win.hidePageTitle = function(){titleview.visible = false;};


	var controlpanel = K.create({
		k_type: "View",
		width: Ti.Platform.displayCaps.platformWidth,
		top: 0
	});
	win.add(controlpanel);


	// ********************* Help func
	
	var helpbtn = C.ui.createButton({
		width: 50,
		left: 50,
		top: 5,
		title: "help",
		k_click: function(){
			if (C.state.currentHelp){
				pb.pub("/showhelpmodal",C.state.currentHelp);
			} else {
				C.ui.showMessage("sys_nohelp");
			}
		}
	});
	function updateHelp(pageid){
		var help = C.content.getHelpForPageId(pageid,C.state.lang);
		if (help){
			helpbtn.title = "HELP";
			C.state.currentHelp = help;
		} else {
			helpbtn.title = "help";
			delete C.state.currentHelp;
		}
	};
	pb.sub("/navto",updateHelp);
	pb.sub("/updatetext",function(){
		updateHelp(C.state.currentPageId);
	});
	controlpanel.add(helpbtn);
	
	Ti.include("/cognitus/ui/helpmodal.js");
	var helpmodal = C.ui.createHelpModal();
	win.add(helpmodal);

	// ********************* Size btn
	
	var sizebtn = C.ui.createButton({
		width: 50,
		top: 5,
		left: 170,
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

	var langtest = C.ui.createButton({
		width: 50,
		top: 5,
		left: 230,
		title: "lang",
		k_click: function(e){
			var lang = C.state.lang;
			C.state.lang = (lang == "en" ? "sv" : lang == "sv" ? "textid" : "en");
			C.state.currentTitle = C.content.getText(C.state.currentPageId+"_title");
			pb.pub("/updatetext");
		}
	});
	controlpanel.add(langtest);


	// ********************* Note button
	var notebutton = C.ui.createButton({
		width: 50,
		top: 5,
		left: 110,
		title: "note",
		k_click: function(e){
			pb.pub("/shownotesmodal");
		}
	});
	controlpanel.add(notebutton);
	pb.sub("/hasnote",function(note){
		notebutton.title = note ? "NOTE" : "note";
	});
	Ti.include("/cognitus/ui/notesmodal.js");
	var notesmodal = C.ui.createNotesModal();
	win.add(notesmodal);




	// ******************* Tabs
	Ti.include("/cognitus/ui/tabstructure2.js"); // <------ OBSERVE! choice of tabstructure file
	win.add(C.ui.createTabStructure(lists,pages));



	// ******************* Frame adjustment
	
	Ti.Gesture.addEventListener('orientationchange', function(e){
		pb.pub("/adjustframe");
	});
	
	pb.sub("/adjustframe",function(){
		if (C.state.showingTabs){
			var tabheight = C.state.currentPage.listhistory.length * Ti.App.Properties.getInt("tabrowheight"),
				platformheight = Ti.Platform.displayCaps.platformHeight,
				platformwidth = Ti.Platform.displayCaps.platformWidth;
			if (C.state.orientation === "landscape"){
				gradientlandscape.visible = true;
				gradientportrait.visible = false;
				
				frame.bottom = 0;
				frame.right = tabheight;
				frame.left = 40;
				frame.top = 0;
				
				controlpanel.transform = Ti.UI.create2DMatrix({rotate:-90});
				//controlpanel.width = Ti.Platform.displayCaps.platformHeight;
				controlpanel.bottom = 0;
				controlpanel.left = 0;
			} else {
				gradientportrait.visible = true;
				gradientlandscape.visible = false;
				
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
			gradientportrait.visible = false;
			gradientlandscape.visible = false;
			
			frame.right = 0;
			frame.left = 0;
			frame.top = 0;
			frame.bottom = 0;
		}
	});



	// ******************* Stuff

	pb.sub("/updatetext",function(){
		Ti.API.log("Textupdate! Calling render in the current view!");
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
		/* TODO - decide if we want back-forward func
		backbtn.opacity = C.state.historyposition ? 1 : 0.5;
		forwardbtn.opacity = C.state.historyposition < C.state.history.length - 1 ? 1 : 0.5;
		*/
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

		C.state.currentPageView = topage.view;
		C.state.currentPage = topage;
		C.state.currentPageId = pageid;
		C.state.currentBack = topage.back;
		C.state.lastArgs = argstouse;
		
		C.state.currentTitle = C.content.getText(pageid+"_title"); // TODO - not using this?
		pb.pub("/updatetitle");
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
		
		if (topage.view.render){
			topage.view.render(argstouse,topage);
		}
		pb.pub("/hasnote",C.content.testIfPageHasNote(C.utils.currentPageName()));
		Ti.API.log("Name: "+C.utils.currentPageName());
		Ti.API.log(C.utils.pageNameToArgs(C.utils.currentPageName()));
		pb.pub("/arrivedatnewpage",topage,argstouse);
	});

	// ******************** Add skill to list button
	var listitembutton = C.ui.createButton({
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
	Ti.include("/cognitus/ui/selectskillmodal.js");   // TODO - observe choice!
	var selectskillmodal = C.ui.createSelectSkillModal();
	win.add(selectskillmodal);
	
	// ********************* List selection panel logic *********************
	Ti.include("/cognitus/ui/selectlistmodal.js");
	var selectlistmodal = C.ui.createSelectListModal();
	win.add(selectlistmodal);
	
	
	

	// ******************** Start logic

	pb.sub("/appstart",function(){
		pb.pub("/navto","home"); // TODO - fix dynamically!
		frame.animate({opacity:1,duration:400},function(){pb.pub("/navto","home");});
	});

    // ******************* All done, returning the window!
    return win;

};