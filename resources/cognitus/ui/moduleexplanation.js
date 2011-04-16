C.ui.createModuleExplanationView = function(o){
	var view = C.ui.createPage({
		ViewId: "moduleexplanation",
		backgroundColor: "green"
	});
	var titlelabel = K.create({
		k_type: "Label",
		height: 20,
		top: 50
	}), label = K.create({
		k_type: "Label",
		top: 100,
		height: 100
	});
	view.add(titlelabel);
	view.add(label);
	view.render = function(args){
		titlelabel.text = C.content.getText("module_"+args.ModuleId+"_title");
		label.text = C.content.getText("module_"+args.ModuleId+"_description");
	};
	return view;
};