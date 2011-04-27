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
	var btn = K.create({
			k_type: "View",
			k_class: "NavButtonView",
			height: 30,
			width: 30,
			top: 40,
			right: 10,
			borderSize: 1,
			borderColor: "#000",
			backgroundColor: "#CCC",
			k_children: [{
				k_type: "Label",
				k_class: "NavButtonLabel",
				k_id: "label",
				text: "x"
			}],
			k_click: function(){
				C.content.toggleSkillOnCrisisList(myskill);
				btn.k_children.label.text = (C.content.testIfSkillOnCrisisList(myskill) ? "-" : "+");
			}
	});
	view.add(btn);
	view.render = function(args){
		myskill = args.SkillId;
		btn.k_children.label.text = (C.content.testIfSkillOnCrisisList(myskill) ? "-" : "+");
		label.text = "S:"+((args && args.SkillId) || "X");
	};
	return view;
};