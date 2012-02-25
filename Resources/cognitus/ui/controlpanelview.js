(function(){
	C.ui.createControlPanelView = function(){
		
		var controlpanel = K.create({
			k_type: "View",
			width: C.state.width, //Math.min(Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight),
			top: 0
		});

		var btnspace = 5, btnwidth = 34;

		// ********************* Back functionality
		var backbtnsx = 70;
		
		var backbtn = C.ui.createButton({
			top: 3,
			left: backbtnsx,
			backgroundImage: "/images/icons/back.png",
			width: btnwidth,
			height: btnwidth,
			enabled: false,
			k_click: function(){
				if (C.state.historyposition>0){
					var to = C.state.history[--C.state.historyposition];
					pb.pub("/navto",to.pageid,K.merge({dontadjusthistory:true},to.args));
				}
			}
		});
		controlpanel.add(backbtn);
		
		var historybtn = C.ui.createButton({
			top: 3,
			left: backbtnsx+btnspace+btnwidth,
			backgroundImage: "/images/icons/history.png",
			width: btnwidth,
			height: btnwidth,
			enabled: false,
			k_click: function(){
				if (C.state.history.length > 1){
					pb.pub("/showhistorymodal");
				}
			}
		});
		controlpanel.add(historybtn);
		
		var forwardbtn = C.ui.createButton({
			top: 3,
			left: backbtnsx+btnspace*2+btnwidth*2,
			backgroundImage: "/images/icons/forward.png",
			width: btnwidth,
			height: btnwidth,
			enabled: false,
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
			backbtn.enabled = !!(C.state.historyposition > 0);
			forwardbtn.opacity = C.state.historyposition < C.state.history.length - 1 ? 1 : 0.5;
			forwardbtn.enabled = !!(C.state.historyposition < C.state.history.length - 1);
			historybtn.opacity = C.state.history.length > 1 ? 1 : 0.5;
			historybtn.enabled = !!(C.state.history.length > 1);
		});


		// ********************* Help functionality
		
		var otherbtnrightoffset = 20;
		

		var helpbtn = C.ui.createButton({
			width: btnwidth,
			height: btnwidth,
			right: otherbtnrightoffset + btnspace*2 + btnwidth*2,
			top: 3,
			selectedBackgroundImage: null,
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
				helpbtn.backgroundImage = "/images/icons/information.png";
				//helpbtn.title = "HELP";
				C.state.currentHelp = help;
			} else {
				helpbtn.backgroundImage = "/images/icons/information_none.png";
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
			height: btnwidth,
			backgroundImage: "/images/icons/settings.png",
			top: 3,
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
			height: btnwidth,
			top: 3,
			backgroundImage: "/images/icons/note_none.png",
			right: otherbtnrightoffset+btnspace+btnwidth,
			k_click: function(e){
				pb.pub("/shownotesmodal");
			}
		});
		controlpanel.add(notebutton);
		pb.sub("/hasnote",function(note){
			notebutton.backgroundImage = "/images/icons/note"+ (note ? "" : "_none")+".png";
		});		

		
		return controlpanel;	
	};
})();