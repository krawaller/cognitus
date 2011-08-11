(function(){
	C.ui.createSettingsModal = function(){
		var admincounter;
		var modal = C.ui.createModal({helptextid:"settingsmodal_help"});
		
		var panel = modal.panel;
		
		panel.add(C.ui.createLabel("sys_bigtabs",{
			top: 60
		}));
		
		var bigswitch = Ti.UI.createSwitch({
			top: 85,
			width: 50,
			height: 30,
			value: Ti.App.Properties.getBool("usingbigtabs")
		});
		if (bigswitch.value === undefined){
			bigswitch.value = false;
		}
		panel.add(bigswitch);
		var startchange = true;
		bigswitch.addEventListener("change",function(e){
			if (startchange){
				startchange = false;
				return;
			}
			Ti.App.Properties.setBool("usingbigtabs",!Ti.App.Properties.getBool("usingbigtabs"));
			pb.pub("/settabrowheight",Ti.App.Properties.getBool("usingbigtabs") ? 40 : 25);
			pb.pub("/adjustframe");
		});
		
		
		var adjust;
		pb.sub("/showsettingsmodal",function(){
			admincounter = 0;
			adjust = true;
			adjust = false;
			picker.setSelectedRow(0,{"sv":1,"en":0,"textid":2}[C.state.lang],false);
			modal.show();
		});
		
		panel.add(C.ui.createLabel("sys_langselect",{
			top: 140
		}));
		
		var picker = Ti.UI.createPicker({
			top: 170,
			width: 140,
			height: 60,
			//left: 40,
			selectionIndicator: true
		});
		panel.add(picker);

		var adminrow = Ti.UI.createPickerRow({title:"[system]",value:"textid"}),
			svrow = Ti.UI.createPickerRow({title:"Svenska",value:"sv"}),
			enrow = Ti.UI.createPickerRow({title:"English",value:"en"});
		
		picker.add([enrow,svrow]);
		
		if (Ti.App.Properties.getBool("adminmode")){
			picker.add(adminrow);
		}

		var adminbtn = Ti.UI.createLabel({
			height: 50,
			width: 80,
			bottom: 0,
			left: 0,
			color: "#FFF"
		});
		panel.add(adminbtn);

		adminbtn.addEventListener("click",function(){
			Ti.API.log("CLICK! "+admincounter);
			if (Ti.App.Properties.getBool("adminmode")){
			} else {
				admincounter++;
				if(admincounter === 5){
					alert("Welcome to admin mode! :)");
					Ti.App.Properties.setBool("adminmode",true);
					picker.add(adminrow);
				}
			}
		});

		picker.addEventListener("change",function(e){
			if (!adjust && e && e.row && e.row.value){
				C.state.lang = e.row.value;
				Ti.App.Properties.setString("chosenlanguage",e.row.value);
				pb.pub("/updatetext");
			}
		});
		
		return modal;
	};
})();