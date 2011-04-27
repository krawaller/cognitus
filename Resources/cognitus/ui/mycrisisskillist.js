

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
			pb.pub("/navto","skillexplanation",{SkillId:e.row.SkillId});
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
			borderSize: 1,
			borderColor: "#000",
			backgroundColor: "#CCC",
			k_children: [{
				k_type: "Label",
				k_class: "NavButtonLabel",
				k_id: "label",
				text: "edit"
			}],
			k_click: function(){
				if (editing){
					table.editing = false;
					editing = false;
					btn.k_children.label.text = "edit";
				} else {
					editing = true;
					table.editing = true;
					btn.k_children.label.text = "done";
				}
			}
	});
	view.add(btn);
	view.render = function(arg){
		var rows = [];
		C.content.getMyCrisisSkills().forEach(function(listobject){ // listobject has SkillId, priority and freetext props
			rows.push({
				SkillId: listobject.SkillId,
				title: listobject.priority+" "+C.content.getText("skill_"+listobject.SkillId+"_title")
			});
		});
		table.setData(rows);
	};
	return view;
};