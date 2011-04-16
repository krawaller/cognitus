C.ui.createSkillsTab = function(o){
	var view = C.ui.createList({
		ViewId: "tabskills",
		backgroundColor: "red",
		defaultChildRole: 0,
		views: [
			C.ui.createAboutModulesView(),
			C.ui.createModuleListView()
		]
	});
	return view;
};