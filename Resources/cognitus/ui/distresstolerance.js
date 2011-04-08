C.ui.createDistressToleranceView = function(o){
	function render(){
		
	};
	var view = C.ui.createPage({
		ViewId: "distresstolerance",
		ViewTitle: "Distress Tolerance",
		backgroundColor: "brown",
		render: render
	});
	view.add( C.ui.createLabel("distresstolerance_description") );
	return view;
};