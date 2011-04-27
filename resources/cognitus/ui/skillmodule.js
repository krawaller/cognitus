C.ui.createSkillModuleView = function(o){
	if (!o.ModuleId){
		throw "No ModuleId provided for skillModule";
	}
	var view = C.ui.createPage({
		ViewId: "module_"+o.ModuleId,
		backgroundColor: "yellow"
	});
	view.using = "ModuleId";
	view.add( C.ui.createLabel("module_"+o.ModuleId+"_description",{height:100,top:70}) );
	return view;
};