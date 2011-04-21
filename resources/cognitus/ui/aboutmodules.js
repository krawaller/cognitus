C.ui.createAboutModulesView = function(o){
	var view = C.ui.createPage({
		backgroundColor: "red"
	});
	view.add( C.ui.createLabel(function(){return "aboutmodules_description";}) );
	return view;
};