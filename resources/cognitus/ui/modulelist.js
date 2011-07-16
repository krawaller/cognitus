C.ui.createModuleListView = function(o){
	var view = C.ui.createPage({});
	//view.add( C.ui.createLabel("modulelist_description",{top:5,k_class:"descriptionlabel"}) );
	var table = C.ui.createTableView({
		top: 30,
		k_click: function(e){
			pb.pub("/navto","moduleexplanation",{ModuleId:e.row.ModuleId});
		}
	});
	view.add(table);
	view.render = function(arg){
		table.setData(C.content.getAllSkillModules().map(function(m){
			return C.ui.createTableViewRow({	
				rightImage: Ti.Filesystem.resourcesDirectory+"/images/icons/goto.png",
				ModuleId: m,
				rowmainlabel: C.content.getText("module_"+m+"_title")
			});
		}));
	};
	return view;
};