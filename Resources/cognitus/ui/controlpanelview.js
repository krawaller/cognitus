(function(){
	C.ui.createControlPanelView = function(){
		
		var controlpanel = K.create({
			k_type: "View",
			width: Ti.Platform.displayCaps.platformWidth,
			top: 0
		});

		// ********************* Help functionality

		var helpbtn = C.ui.createButton({
			width: 30,
			left: 50,
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
			width: 30,
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/settings.png",
			top: 5,
			left: 170,
			//title: "size",
			k_click: function(){
				pb.pub("/showsettingsmodal");
			}
		});
		controlpanel.add(settingsbtn);

		// ********************* Note button
		var notebutton = C.ui.createButton({
			width: 30,
			top: 5,
			left: 110,
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