C.ui.createSkillsView = function(o){
	function render(){
		
	};
	var view = C.ui.createComposition({
		ViewId: "skillsview",
		ViewTitle: "All skills",
		backgroundColor: "red",
		views: [
			C.ui.createMindfulnessView(),
			C.ui.createDistressToleranceView()
		]
	});
	return view;
};