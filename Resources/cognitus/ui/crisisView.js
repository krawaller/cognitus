C.ui.createCrisisView = function(o){
	var view = C.ui.createPage({
		ViewId: "crisis",
		backgroundColor: "blue"
	});
	view.add( C.ui.createLabel(function(){return "crisis_description";}) );
	return view;
};