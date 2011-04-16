C.ui.createAboutModulesView = function(o){
	var view = C.ui.createPage({
		ViewId: "aboutmodules",
		backgroundColor: "red"
	});
	view.add( C.ui.createLabel(function(){return "aboutmodules_description";}) );
	return view;
};