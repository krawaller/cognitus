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
		view.visible = true;
		selbtn.opacity = 0.5;
		selbtn.title = C.content.getText("selectskillmodal_btn_selskill");
		Ti.API.log(["MOO",excluded]);
		view.k_children.panel.k_children.table.setData(C.content.getAllSkillModules().map(function(moduleid){
			return K.create({
				k_type: "TableViewSection",
				headerTitle: C.content.getText("module_"+moduleid+"_title"),
				rows: C.content.getSkillsForModule(moduleid).map(function(skillid){
					Ti.API.log(["CREATING SKILLTABLE",skillid,excluded.length,excluded.indexOf(skillid)]);
					var x = excluded.indexOf(skillid) != -1;
					return K.create({
						k_type: "TableViewRow",
						skillid: skillid,
						selected: false,
						title: (x ? "(" : "")+C.content.getText("skill_"+skillid+"_title")+(x?")":""),
						backgroundColor: x ? "#CCC" : "#FFF",
						excluded: x
					});
				})
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
						Ti.API.log(["Clicked skill!",e.row, e.row.skillid, e.row.excluded,selectedrow && selectedrow.skillid]);
						if (e.row && !e.row.excluded){
							if (selectedrow && selectedrow.skillid === e.row.skillid){ // tapping already chosen, select it!
								selectcb(selectedrow.skillid);
								view.visible = false;
								return;
							}
							if (selectedrow) { 
								selectedrow.backgroundColor = "#FFF";
								selbtn.title = C.content.getText("selectskillmodal_btn_sel")+" "+C.content.getText("skill_"+e.row.skillid+"_title");
							} else {
								selbtn.opacity = 1;
							}
							selectedrow = e.row;
							e.row.backgroundColor = "yellow";
						}
					},
					doubletap: function(e){
						if (e.row && !e.row.excluded){
							selectcb(selectedrow.skillid);
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
		width: 120,
		k_click: function(e){
			if (selectedrow){
				selectcb(selectedrow.skillid);
				view.visible = false;
			}
		}
	});
	view.k_children.panel.add(selbtn);

	view.show = show;
	
	pb.sub("/showselectskillmodal",show);/*function(excl,sel,cncl){
		show(excl,sel,cncl);
	});*/
	
	return view;
};