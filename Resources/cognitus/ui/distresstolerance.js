C.ui.createDistressToleranceView = function(o){
	function render(){
		
	};
	var view = C.ui.createPage({
		ViewId: "distresstoleranceview",
		ViewTitle: "Distress Tolerance",
		backgroundColor: "brown",
		render: render
	});
	view.add( K.create({k_type:"Label",text:"Tolerate distress wooo!"}) );
	return view;
};