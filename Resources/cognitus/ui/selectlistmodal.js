C.ui.createSelectListModal = function(){
	var cancelcb, selectcb;
	function cancel(){
		view.visible = false;
		if (cancelcb){
			cancelcb();
		}
	}
	function show(excluded,a_selectcb,a_cancelcb){
		excluded = excluded.map(function(r){return r.ListId;});
		cancelcb = a_cancelcb;
		selectcb = a_selectcb;
		selectedrow = null;
		view.visible = true;
		selbtn.opacity = 0.5;
		selbtn.title = C.content.getText("selectlistmodal_btn_sellist");
		cancelbtn.title = C.content.getText("selectlistmodal_btn_cancel");
		view.k_children.panel.k_children.table.setData(C.content.getMyListsWithSkillCount().map(function(l){
			var x = excluded.indexOf(l.ListId) != -1;
			return K.create({
				k_type: "TableViewRow",
				ListId: l.ListId,
				selected: false,
				listtitle: l.title,
				title: (x ? "(" : "")+l.title+" ("+l.skillcount+")"+(x?")":""),
				backgroundColor: x ? "#CCC" : "#FFF",
				excluded: x
			});
		}));
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
			k_id: "panel",
			k_children: [{
				k_type: "TableView",
				k_id: "table",
				top: 100,
				k_events: {
					click: function(e){
						Ti.API.log(["Clicked list!",e.row, e.row.ListId, e.row.excluded,selectedrow && selectedrow.ListId]);
						if (e.row && !e.row.excluded){
							if (selectedrow && selectedrow.ListId === e.row.ListId){ // tapping already chosen, select it!
								selectcb(selectedrow.ListId);
								view.visible = false;
								return;
							}
							if (selectedrow) { // we already had a selected row
								selectedrow.backgroundColor = "#FFF";
							} else {
								selbtn.opacity = 1;
							}
							selbtn.title = C.content.getText("selectlistmodal_btn_sel")+" "+e.row.listtitle;
							selectedrow = e.row;
							e.row.backgroundColor = "yellow";
						}
					},
					doubletap: function(e){
						if (e.row && !e.row.excluded){
							selectcb(selectedrow.ListId);
							view.visible = false;
						}
					}
				}
			}]
		}]
	});
	
	var selbtn = C.ui.createButton({
		k_type: "Button",
		top: 40,
		right: 10,
		width: 180,
		k_click: function(e){
			if (selectedrow){
				selectcb(selectedrow.ListId);
				view.visible = false;
			}
		}
	});
	view.k_children.panel.add(selbtn);
	
	var cancelbtn = C.ui.createButton({
		k_type: "Button",
		top: 40,
		left: 10,
		width: 70,
		k_click: cancel
	});
	view.k_children.panel.add(cancelbtn);


	view.show = show;
	
	pb.sub("/showselectlistmodal",show);
	
	return view;
};