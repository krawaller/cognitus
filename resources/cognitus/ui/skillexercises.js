C.ui.createSkillExercisesView = function(o){
	var view = C.ui.createPage({
		backgroundColor: "purple"
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
	view.using = "SkillId";
	view.render = function(args){
		label.text = "S:"+((args && args.SkillId) || "X");
	};
	return view;
};