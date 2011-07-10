(function(){
	C.ui.createSettingsModal = function(){
		var modal = K.create({
			k_type: "View",
			backgroundColor: "rgba(0,0,0,0.8)",
			visible: false,
			zIndex: 150,
			k_id: "modal",
			k_click: function(e) {
				if (e.source.k_id === "modal") {
					close();
				}
			},
			k_children: [{
				k_type: "View",
				borderSize: 1,
				borderColor: "#000",
				backgroundColor: "#FFF",
				top: 20,
				left: 20,
				right: 20,
				bottom: 20,
				k_id: "panel"
			}]
		});

		function close(){
			modal.visible = false;
		}
		
		var panel = modal.k_children.panel;
		
		var closebtn = C.ui.createButton({
			k_type: "Button",
			top: 10,
			height: 30,
			left: 10,
			width: 30,
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/close.png",
			//textid: "helpmodal_btn_close",
			k_click: close
		});

		panel.add(closebtn);

		function show(){
			panel.left = 10;
			panel.right = 10;
			panel.bottom = 10;
			picker.setSelectedRow(0,{"sv":1,"en":0,"textid":3}[C.state.lang],false);
			modal.visible = true;
		}
		
		panel.add(C.ui.createLabel("sys_bigtabs",{
			top: 60
		}));
		
		var bigswitch = Ti.UI.createSwitch({
			top: 85,
			width: 50,
			height: 30,
			value: !Ti.App.Properties.getBool("usingbigtabs")
		});
		panel.add(bigswitch);
		bigswitch.addEventListener("change",function(e){
			Ti.API.log("CHANGE!!!!");
			Ti.App.Properties.setBool("usingbigtabs",!Ti.App.Properties.getBool("usingbigtabs"));
			pb.pub("/settabrowheight",Ti.App.Properties.getBool("usingbigtabs") ? 40 : 25);
			pb.pub("/adjustframe");
		});
		
		
		
		pb.sub("/showsettingsmodal",show);
		
		/*
		var settingsbtn = C.ui.createButton({
			width: 30,
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/settings.png",
			top: 5,
			left: 170,
			//title: "size",
			k_click: function(){
				var rowdefaultheight = 25, rowbigheight = 40;
				var currenth = Ti.App.Properties.getInt("tabrowheight"),
					newh = (currenth===rowdefaultheight?rowbigheight:rowdefaultheight);
				Ti.App.Properties.setInt("tabrowheight",newh);
				pb.pub("/settabrowheight",newh);
				pb.pub("/adjustframe");
			}
		});
		*/
		
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
			C.state.lang = e.row.value;
			pb.pub("/updatetext");
		});
		
		return modal;
	};
})();