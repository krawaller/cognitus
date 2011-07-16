(function(){
	C.ui.createControlPanelView = function(){
		
		var controlpanel = K.create({
			k_type: "View",
			width: Ti.Platform.displayCaps.platformWidth,
			top: 0
		});

		var btnspace = 5, btnwidth = 30;

		// ********************* Back functionality
		var backbtnsx = 70;
		
		var backbtn = C.ui.createButton({
			top: 5,
			left: backbtnsx,
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/back.png",
			width: btnwidth,
			height: 30,
			k_click: function(){
				if (C.state.historyposition>0){
					var to = C.state.history[--C.state.historyposition];
					pb.pub("/navto",to.pageid,K.merge({dontadjusthistory:true},to.args));
				}
			}
		});
		controlpanel.add(backbtn);
		
		var historybtn = C.ui.createButton({
			top: 5,
			left: backbtnsx+btnspace+btnwidth,
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/history.png",
			width: btnwidth,
			height: 30,
			k_click: function(){
				if (C.state.history.length){
					pb.pub("/showhistorymodal");
				}
			}
		});
		controlpanel.add(historybtn);
		
		var forwardbtn = C.ui.createButton({
			top: 5,
			left: backbtnsx+btnspace*2+btnwidth*2,
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/forward.png",
			width: btnwidth,
			height: 30,
			k_click: function(){
				if (C.state.historyposition < C.state.history.length-1){
					var to = C.state.history[++C.state.historyposition];
					pb.pub("/navto",to.pageid,K.merge({dontadjusthistory:true},to.args));
				}
			}
		});
		controlpanel.add(forwardbtn);

		pb.sub("/changedhistoryposition",function(){
			backbtn.opacity = C.state.historyposition ? 1 : 0.5;
			forwardbtn.opacity = C.state.historyposition < C.state.history.length - 1 ? 1 : 0.5;
			historybtn.opacity = C.state.history.length > 1 ? 1 : 0.5;
		});


		// ********************* Help functionality
		
		var otherbtnrightoffset = 20;
		

		var helpbtn = C.ui.createButton({
			width: btnwidth,
			right: otherbtnrightoffset + btnspace*2 + btnwidth*2,
			top: 5,
			//title: "help",
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
				helpbtn.image = Ti.Filesystem.resourcesDirectory+"/images/icons/information.png";
				//helpbtn.title = "HELP";
				C.state.currentHelp = help;
			} else {
				helpbtn.image = Ti.Filesystem.resourcesDirectory+"/images/icons/information_none.png";
				//helpbtn.title = "help";
				delete C.state.currentHelp;
			}
		};
		pb.sub("/navto",updateHelp);
		pb.sub("/updatetext",function(){
			updateHelp(C.state.currentPageId);
		});
		controlpanel.add(helpbtn);

		// ********************* Size btn

		var settingsbtn = C.ui.createButton({
			width: btnwidth,
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/settings.png",
			top: 5,
			right: otherbtnrightoffset,
			//title: "size",
			k_click: function(){
				pb.pub("/showsettingsmodal");
			}
		});
		controlpanel.add(settingsbtn);

		// ********************* Note button
		var notebutton = C.ui.createButton({
			width: btnwidth,
			top: 5,
			right: otherbtnrightoffset+btnspace+btnwidth,
			k_click: function(e){
				pb.pub("/shownotesmodal");
			}
		});
		controlpanel.add(notebutton);
		pb.sub("/hasnote",function(note){
			notebutton.image = Ti.Filesystem.resourcesDirectory+"/images/icons/note"+ (note ? "" : "_none")+".png";
		});		

		
		return controlpanel;	
	};
})();