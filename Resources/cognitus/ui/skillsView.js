C.ui.createSkillsView = function(o){
	function render(){
		
	};
	var view = C.ui.createHeadedList({
		ViewId: "skillsview",
		backgroundColor: "red",
		table: {top:150},
		views: [
			C.ui.createModulesView(),
			C.ui.createSkillModuleView({ModuleId:"mindfulness"}),
			C.ui.createSkillModuleView({ModuleId:"distresstolerance"})
		]
	});
	return view;
};