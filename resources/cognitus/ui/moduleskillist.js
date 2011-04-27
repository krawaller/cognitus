C.ui.createModuleSkillListView = function(o){
	var view = C.ui.createPage({
		backgroundColor: "yellow"
	});
	view.add( C.ui.createLabel(function(){return "moduleskillist_description";},{height:100,top:100}) );
	var table = K.create({
		k_type: "TableView",
		top: 200,
		//style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		k_click: function(e){
			pb.pub("/navto","skillexplanation",{SkillId:e.row.SkillId,ModuleId:e.row.ModuleId});
		}
	});
	view.add(table);
	view.render = function(arg){
		var rows = [];
		C.content.getSkillsForModule(arg.ModuleId).forEach(function(s){
			rows.push({
				SkillId: s,
				ModuleId: arg.ModuleId,
				title: C.content.getText("skill_"+s+"_title")
			});
		});
		table.setData(rows);
	};
	view.using = "ModuleId";
	return view;
};