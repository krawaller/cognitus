(function(){
	C.ui.createSettingsModal = function(){
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
		
		
		
		pb.sub("/showsettingsmodal",function(){
			picker.setSelectedRow(0,{"sv":1,"en":0,"textid":3}[C.state.lang],false);
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
		picker.add([Ti.UI.createPickerRow({title:"English",value:"en"}),
		Ti.UI.createPickerRow({title:"Svenska",value:"sv"}),
		Ti.UI.createPickerRow({title:"[system]",value:"textid"})]);

		picker.addEventListener("change",function(e){
			if (e && e.row && e.row.value){
				C.state.lang = e.row.value;
				pb.pub("/updatetext");
			}
		});
		
		return modal;
	};
})();