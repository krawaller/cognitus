C.ui.createModuleSkillListView = function(o){
	var view = C.ui.createPage({
		backgroundColor: "yellow"
	});
	view.add( C.ui.createLabel(function(){return "moduleskillist_description";},{height:100,top:20}) );
	var table = K.create({
		k_type: "TableView",
		top: 100,
		//style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		k_click: function(e){
			pb.pub("/navto","skillrational",{SkillId:e.row.SkillId,ModuleId:e.row.ModuleId});
		}
	});
	view.add(table);
	view.render = function(arg){
		table.setData(C.content.getSkillsForModule(arg.ModuleId).map(function(s){
			return {
				hasChild: true,
				SkillId: s,
				ModuleId: arg.ModuleId,
				title: C.content.getText("skill_"+s+"_title")
			};
		}));
	};
	view.using = "ModuleId";
	return view;
};