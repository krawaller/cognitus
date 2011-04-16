C.ui.createSkillExamplesView = function(o){
	var view = C.ui.createPage({
		backgroundColor: "gray"
	});
	//view.add( C.ui.createLabel(function(){return "moduleexplanation_description";}) );
	var label = K.create({
		k_type: "Label",
		height: 20,
		width: 50,
		top: 50,
		left: 10
	});
	view.add(label);
	view.render = function(args){
		label.text = "S:"+((args && args.SkillId) || "X");
	};
	return view;
};