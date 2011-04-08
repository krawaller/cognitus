C.ui.createMindfulnessView = function(o){
	function render(){
		
	}
	var view = C.ui.createPage({
		ViewId: "mindfulness",
		ViewTitle: "Mindfulness",
		backgroundColor: "yellow",
		render: render
	});
	view.add( C.ui.createLabel("mindfulness_description") );
	return view;
};