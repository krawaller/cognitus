

C.ui.createMyCrisisSkillListView = function(o){
	var view = C.ui.createPage({
		backgroundColor: "blue"
	});
	view.add( C.ui.createLabel(function(){return "mycrisisskillist_description";},{height:30,top:50}) );
	var table = K.create({
		k_type: "TableView",
		editable:true,
		moveable:true,
		top: 150,
		//style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		k_click: function(e){
			pb.pub("/showcrisislistitempanel",e.row.SkillId,true);
			//pb.pub("/navto","skillexplanation",{SkillId:e.row.SkillId});
		},
		k_events: {
			"delete": function(e){
				C.content.removeSkillFromCrisisList(e.row.SkillId);
			},
			move: function(e){
				C.content.updateSkillPositionOnCrisisList(e.row.SkillId,e.index,e.fromIndex);
				var rows = [];
				C.content.getMyCrisisSkills().forEach(function(listobject){ // listobject has SkillId, priority and freetext props
					rows.push({
						SkillId: listobject.SkillId,
						title: listobject.priority+" "+C.content.getText("skill_"+listobject.SkillId+"_title")
					});
				});
				table.setData(rows);
			}
		}
	});
	view.add(table);
	var editing = false;
	var btn = K.create({
			k_type: "View",
			k_class: "NavButtonView",
			height: 30,
			width: 30,
			top: 40,
			right: 10,
			zIndex: 5,
			k_children: [{
				k_type: "Label",
				k_class: "NavButtonLabel",
				k_id: "label"
			}],
			k_click: function(){
				if (editing){
					table.editing = false;
					editing = false;
					btn.k_children.label.text = C.content.getText("crisislist_button_edit");
				} else {
					editing = true;
					table.editing = true;
					btn.k_children.label.text = C.content.getText("crisislist_button_done");
				}
			}
	});
	view.add(btn);
	view.render = function(arg){
		btn.k_children[0].text = C.content.getText("crisislist_button_"+(editing?"done":"edit"));
		var rows = [];
		C.content.getMyCrisisSkills().forEach(function(listobject){ // listobject has SkillId, priority and freetext props
			rows.push(K.create({
				k_type: "TableViewRow",
				SkillId: listobject.SkillId,
				height: 60,
				k_children: [{
					k_type: "Label",
					top: 0,
					left: 20,
					textAlign: "left",
					font: {
						fontSize: 10
					},
					text: C.content.getText("module_"+C.content.getModuleForSkill(listobject.SkillId)+"_title")
				},{
					k_type: "Label",
					top: 12,
					left: 5,
					textAlign: "left",
					font: {
						fontSize: 15,
						fontWeight: "bold"
					},
					text: C.content.getText("skill_"+listobject.SkillId+"_title")
				},{
					k_type: "Label",
					top: 28,
					left: 40,
					height: 30,
					textAlign: "left",
					width: $$.platformWidth,
					font: {
						fontSize: 12,
						fontStyle: "italic"
					},
					text: listobject.freetext
				}]
			}));
		});
		table.setData(rows);
	};
	return view;
};