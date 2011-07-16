/*
Creates main app window, and deals with navigation.
Includes these files:
  htmlview.js
  title.js
  helpmodal.js
  notesmodal.js
  tabstructure(2).js
  selectskillmodal.js
  selectlistmodal.js
  controlpanel.js
*/

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
	C.state.pages = pages;
	C.state.lists = lists;
	


    // ***************** Creating the window object and adding the pages
    var win = K.create({
        k_type: "Window",
        exitOnClose: true,
        orientationModes: [
			Titanium.UI.PORTRAIT,
			/*Titanium.UI.UPSIDE_PORTRAIT,
			Titanium.UI.LANDSCAPE_LEFT,
			Titanium.UI.LANDSCAPE_RIGHT*/
		],
		opacity: 1,
        fullscreen: true,
		backgroundColor: "transparent"
    });
	win.backgroundColor = "transparent";
	//win.backgroundImage = Ti.Filesystem.resourcesDirectory+'/iphone/Default.png';
	var swipedir;
	var GRADIENTBREDTH = 12;
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
			top: 60,
			k_id: "pagecontainer"
		},/*{
			k_type: "View",
			width: 1,
			left: 0,
			backgroundColor: "#000"
		},*/{
			k_type: "View",
			k_id: "gradientportrait",
			height: GRADIENTBREDTH,
			bottom: 0,
			zIndex: 1337,
			backgroundImage: "images/gradient_bottom.png"
		},{
			k_type: "View",
			k_id: "gradientportraittop",
			height: GRADIENTBREDTH,
			top: 60,
			zIndex: 1337,
			backgroundImage: "images/gradient_top.png"
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
		gradientlandscape = frame.k_children.gradientlandscape,
		pagecontainer = frame.k_children.pagecontainer;

    for (var pid in pages) {
        var page = pages[pid];
		if (page.view){
        	page.view.visible = false;
        	pagecontainer.add(page.view);
		}
    }
	C.state.frame = frame;


	// ******************* Basic text view
	
	Ti.include("/cognitus/ui/htmlview.js");
	var textview = C.ui.createHtmlView({});
	pagecontainer.add(textview);

	// controls
	
	
	function toggleControls(){
		C.state.showingTabs = !C.state.showingTabs;
		anchor.image = Ti.Filesystem.resourcesDirectory+"/images/icons/" + (C.state.showingTabs ? "fullscreen" : "navigation")+".png";
		pb.pub("/adjustframe");
	}
	
	var anchor = C.ui.createButton({
		zIndex: 100,
		height: 30,
		width: 30,
		left: 5,
		top: 5,
		//title: "↓",
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/fullscreen.png",
		k_click: toggleControls
	});
	
	win.add(anchor);

	Ti.include("/cognitus/ui/title.js");
	var titleview = C.ui.createTitleView();
	frame.add(titleview);
	
	win.showPageTitle = function(){titleview.visible = true;};
	win.hidePageTitle = function(){titleview.visible = false;};
	
	// ******************** Notes modal
	
	Ti.include("/cognitus/ui/notesmodal.js");
	var notesmodal = C.ui.createNotesModal();
	win.add(notesmodal);

	// ******************** Help modal
	
	Ti.include("/cognitus/ui/helpmodal.js");
	var helpmodal = C.ui.createHelpModal();
	win.add(helpmodal);	

	// ******************** Top-screen Control panel

	Ti.include("/cognitus/ui/controlpanelview.js");
	var controlpanel = C.ui.createControlPanelView();
	
	K.create({
		k_type: "View",
		width: Ti.Platform.displayCaps.platformWidth,
		top: 0
	});
	win.add(controlpanel);




	// ******************* Tabs
	Ti.include("/cognitus/ui/tabstructure2.js"); // <------ OBSERVE! choice of tabstructure file
	win.add(C.ui.createTabStructure(lists,pages));



	// ******************* Frame adjustment
	
	/*Ti.Gesture.addEventListener('orientationchange', function(e){
		pb.pub("/adjustframe");
	});*/
	
	pb.sub("/adjustframe",function(){
		if (C.state.showingTabs){
			var tabheight = C.state.currentPage.listhistory.length * (Ti.App.Properties.getBool("usingbigtabs") ? 40 : 25),
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

	
	// ********************* Skill selection panel logic *********************
	Ti.include("/cognitus/ui/selectskillmodal.js"); 
	var selectskillmodal = C.ui.createSelectSkillModal();
	win.add(selectskillmodal);
	
	
	// ********************* List selection panel logic *********************
	Ti.include("/cognitus/ui/selectlistmodal.js");
	var selectlistmodal = C.ui.createSelectListModal();
	win.add(selectlistmodal);

	// ********************** Settings modal ********************************
	Ti.include("/cognitus/ui/settingsmodal.js");
	var settingsmodal = C.ui.createSettingsModal();
	win.add(settingsmodal);

	// ********************** History modal ********************************
	Ti.include("/cognitus/ui/historymodal.js");
	var historymodal = C.ui.createHistoryModal();
	win.add(historymodal);


	// ******************* Stuff

	pb.sub("/updatetext",function(){
		if (C.state.currentPageView.render){
			C.state.currentPageView.render(C.state.lastArgs,C.state.currentPage);
		}
	});

	// ******************* Navigation logic
	
	pb.sub("/navto",function(pageid,args){
		titleview.visible = true;
		// arguments
		C.state.lastArgs && delete C.state.lastArgs.addSkillId;
		args = args || {};
		var argstouse = K.merge(args || {},C.state.lastArgs || {});
		if (argstouse.SkillId && !argstouse.ModuleId){
			argstouse.ModuleId = C.content.getModuleForSkill(argstouse.SkillId);
		}
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
			C.state.history.push({pageid:pageid,args:args,titles:C.utils.getPageTitle(topage,args),historyposition:C.state.historyposition});
			if (C.state.history.length>historymax){
				C.state.history = C.state.history.splice(C.state.history.length-historymax);
				C.state.historyposition = C.state.history.length - 1; // since we'll only truncate after normal move, thus we're at the front!
			}
		}
		pb.pub("/changedhistoryposition");
		delete args.dontadjusthistory;
		
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

		C.state.currentPageView = topage.view;
		C.state.currentPage = topage;
		C.state.currentPageId = pageid;
		C.state.currentBack = topage.back;
		C.state.lastArgs = argstouse;
		
		C.state.currentTitle = C.content.getText(pageid+"_title"); // TODO - not using this?
		pb.pub("/updatetitle");
		pb.pub("/updatetabs",pageid);
		pb.pub("/adjustframe");
		
		if (topage.view.render){
			topage.view.render(argstouse,topage);
		}
		pb.pub("/hasnote",C.content.testIfPageHasNote(C.utils.currentPageName()));
		pb.pub("/arrivedatnewpage",topage,argstouse);
	});


	// ******************** Start logic

	pb.sub("/appstart",function(){
		pb.pub("/navto","home"); // TODO - fix dynamically!
		frame.animate({opacity:1,duration:400},function(){pb.pub("/navto","home");});
	});

    // ******************* All done, returning the window!
    return win;

};