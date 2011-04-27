C.ui.createModuleTrainSessionView = function(o){
	var view = C.ui.createPage({});
	view.add( C.ui.createLabel(function(){return "moduletrainsession_description";}) );
	return view;
};