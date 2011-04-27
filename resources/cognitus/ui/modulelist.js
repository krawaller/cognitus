C.ui.createModuleListView = function(o){
	var view = C.ui.createPage({
		backgroundColor: "blue"
	});
	view.add( C.ui.createLabel(function(){return "modulelist_description";},{height:100,top:20}) );
	var table = K.create({
		k_type: "TableView",
		top: 200,
		//style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		k_click: function(e){
			pb.pub("/navto","moduleexplanation",{ModuleId:e.row.ModuleId});
		}
	});
	view.add(table);
	view.render = function(arg){
		var rows = [];
		C.content.getAllSkillModules().forEach(function(m){
			rows.push({
				ModuleId: m,
				title: C.content.getText("module_"+m+"_title")
			});
		});
		table.setData(rows);
	};
	return view;
};