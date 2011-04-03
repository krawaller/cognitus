C.ui.createMindfulnessView = function(o){
	function render(){
		
	};
	var view = C.ui.createPage({
		ViewId: "mindfulnessview",
		ViewTitle: "Mindfulness",
		backgroundColor: "yellow",
		render: render
	});
	view.add( K.create({k_type:"Label",text:"Mindfulness ftw!"}) );
	return view;
};