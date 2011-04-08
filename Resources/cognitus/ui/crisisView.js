C.ui.createCrisisView = function(o){
	function render(){
		
	};
	var view = C.ui.createPage({
		ViewId: "crisis",
		ViewTitle: "Crisis!",
		backgroundColor: "blue",
		render: render
	});
	view.add( C.ui.createLabel("crisis_description") );
	return view;
};