C.ui.createSkillsView = function(o){
	function render(){
		
	};
	var view = C.ui.createHeadedList({
		ViewId: "skillsview",
		ViewTitle: "All skills",
		backgroundColor: "red",
		table: {top:150},
		views: [
			C.ui.createModulesView(),
			C.ui.createMindfulnessView(),
			C.ui.createDistressToleranceView()
		]
	});
	return view;
};