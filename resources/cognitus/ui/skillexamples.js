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
	var myskill;
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
		titlelabel.text = C.content.getText("skill_"+args.SkillId+"_title");
		label.text = C.content.getText("skill_"+args.SkillId+"_example");
	};
	return view;
};