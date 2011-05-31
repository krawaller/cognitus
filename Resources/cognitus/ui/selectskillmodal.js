C.ui.createSelectSkillModal = function(){
	var cancelcb, selectcb;
	function cancel(){
		view.visible = false;
		if (cancelcb){
			cancelcb();
		}
	}
	function show(excluded,a_selectcb,a_cancelcb){
		excluded = excluded.map(function(r){return r.SkillId;});
		cancelcb = a_cancelcb;
		selectcb = a_selectcb;
		selectedrow = null;
		view.visible = true;
		sellabel.text = C.content.getText("selectskillmodal_instruction");
		cancelbtn.title = C.content.getText("selectskillmodal_btn_cancel");
		var lastoffset = 50, totaloffset = 50;
		table.render(undefined,excluded);
	}
	
	var selectedrow;
	
	var view = K.create({
		k_type: "View",
		backgroundColor: "rgba(0,0,0,0.8)",
		visible: false,
		zIndex: 150,
		k_id: "modal",
		k_click: function(e) {
			if (e.source.k_id === "modal") {
				cancel();
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
		//	layout: "vertical",
			k_id: "panel"
		}]
	});
	
	var panel = view.k_children.panel;
	
	
	function click(skillid){
		selectcb(skillid);
		view.visible = false;
	}
	
	var table = C.ui.createSkillTable({top:50,left: 0},click);
	panel.add(table);
	
	var sellabel = Ti.UI.createLabel({
		top: 10,
		height: 30,
		right: 10,
		width: 180,
		text: "MOO"
	});
	panel.add(sellabel);
	
	var cancelbtn = C.ui.createButton({
		k_type: "Button",
		top: 10,
		height: 30,
		left: 10,
		width: 70,
		k_click: cancel
	});
	panel.add(cancelbtn); 

	view.show = show;
	
	pb.sub("/showselectskillmodal",show);
	
	return view;
};