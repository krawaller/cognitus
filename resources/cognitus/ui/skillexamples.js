C.ui.createSkillExamplesView = function(o){
	var view = C.ui.createPage({
		backgroundColor: "fuchsia"
	});
	var titlelabel = K.create({
		k_type: "Label",
		height: 20,
		top: 50
	}), label = K.create({
		k_type: "Label",
		top: 150,
		height: 100,
		width: 300,
		left: 0
	});
	view.add(titlelabel);
	view.add(label);
	view.using = "SkillId";
	view.render = function(args){
		titlelabel.text = C.content.getText("skill_"+args.SkillId+"_title");
		label.text = C.content.getText("skill_"+args.SkillId+"_example");
	};
	return view;
};