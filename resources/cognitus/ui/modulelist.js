C.ui.createModuleListView = function(o){
	var view = C.ui.createPage({});
	view.add( C.ui.createLabel(function(){return "modulelist_description";},{height:100,top:20}) );
	var table = K.create({
		k_type: "TableView",
		top: 100,
		//style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		k_click: function(e){
			pb.pub("/navto","moduleexplanation",{ModuleId:e.row.ModuleId});
		}
	});
	view.add(table);
	view.render = function(arg){
		table.setData(C.content.getAllSkillModules().map(function(m){
			return {
				//hasChild: true,
				rightImage: Ti.Filesystem.resourcesDirectory+"/images/icons/goto.png",
				ModuleId: m,
				title: C.content.getText("module_"+m+"_title")
			};
		}));
	};
	return view;
};