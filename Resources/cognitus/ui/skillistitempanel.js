//(function() {
	C.ui.createSkillListItemPanel = function() {
		var crisislistitempanel = K.create({
			k_type: "View",
			backgroundColor: "rgba(0,0,0,0.8)",
			visible: false,
			zIndex: 150,
			k_id: "modal",
			k_click: function(e) {
				if (e.source.k_id === "modal") {
					hideCrisisListItemPanel(cip_skillid, cip_fromlist);
				}
			},
			k_children: [{
				k_type: "View",
				borderSize: 1,
				borderColor: "#000",
				backgroundColor: "#EEE",
				top: 20,
				left: 20,
				right: 20,
				bottom: 20,
				k_id: "panel",
				k_children: [{
					k_type: "Label",
					k_class: "sublabel",
					top: 10,
					height: 15,
					k_id: "modulelabel"
				},
				{
					k_type: "Label",
					k_class: "titlelabel",
					top: 30,
					height: 20,
					k_id: "skillabel"
				},
				{
					k_type: "Label",
					k_class: "instructionlabel",
					top: 55,
					height: 50,
					k_id: "instructionlabel"
				},
				{
					k_type: "TextArea",
					top: 110,
					height: 80,
					width: 200,
					left: 20,
					borderColor: "#CCC",
					borderSize: 1,
					value: "foo",
					k_id: "textarea"
				}]
			}]
		});
		var cip = crisislistitempanel.k_children.panel,
			cip_modlabel = cip.k_children.modulelabel,
			cip_skillabel = cip.k_children.skillabel,
			cip_instrlabel = cip.k_children.instructionlabel,
			cip_textarea = cip.k_children.textarea,
			cip_delbtn = C.ui.createButton({
			width: 100,
			bottom: 50,
			left: 10,
			k_click: function(e) {
				C.content.removeSkillFromCrisisList(cip_skillid);
				showMessage("crisislistitem_message_deleted");
				setCrisisListItemPanelToAdd();
			}
		}),
			cip_closebtn = C.ui.createButton({
			width: 100,
			bottom: 10,
			right: 10,
			k_click: function(e) {
				hideCrisisListItemPanel(cip_skillid, cip_fromlist);
			}
		}),
			cip_addbtn = C.ui.createButton({
			width: 100,
			bottom: 50,
			right: 10,
			k_click: function(e) {
				if (cip_textarea.value && cip_textarea.value.length) {
					C.content.addSkillToCrisisList(cip_skillid, cip_textarea.value);
					C.ui.showMessage("crisislistitem_message_added");
					setCrisisListItemPanelToUpdate();
				} else {
					C.ui.showMessage("crisislistitem_message_textneeded", "error");
				}
			}
		}),
			cip_updatebtn = C.ui.createButton({
			width: 100,
			bottom: 50,
			right: 10,
			k_click: function(e) {
				if (cip_textarea.value && cip_textarea.value.length) {
					C.content.updateSkillUsageTextOnCrisisList(cip_skillid, cip_textarea.value);
					C.ui.showMessage("crisislistitem_message_updated");
				} else {
					C.ui.showMessage("crisislistitem_message_textneeded", "error");
				}
			}
		}),
			cip_gotobtn = C.ui.createButton({
			height: 30,
			width: 100,
			bottom: 10,
			left: 10,
			k_click: function(e) {
				if (cip_fromlist) {
					pb.pub("/navto", "skillrational", {
						SkillId: cip_skillid
					});
				} else {
					pb.pub("/navto", "mycrisisskillist");
				}
				hideCrisisListItemPanel(cip_skillid, cip_fromlist);
			}
		}),
			cip_fromlist, cip_isonlist, cip_skillid;
		cip.add(cip_gotobtn);
		cip.add(cip_closebtn);
		cip.add(cip_updatebtn);
		cip.add(cip_addbtn);
		cip.add(cip_delbtn);

		function hideCrisisListItemPanel(skillid, fromlist) {
			pb.pub("/hidcrisislistitempanel");
			crisislistitempanel.visible = false;
		}


		function setCrisisListItemPanelToAdd() {
			cip_instrlabel.text = C.content.getText("crisislistitem_instruction_add");
			cip_delbtn.visible = false;
			cip_updatebtn.visible = false;
			cip_addbtn.visible = true;
			cip_textarea.value = "";
		}


		function setCrisisListItemPanelToUpdate() {
			cip_instrlabel.text = C.content.getText("crisislistitem_instruction_update");
			cip_textarea.value = C.content.getCrisisListItemUsageText(cip_skillid);
			cip_delbtn.visible = true;
			cip_addbtn.visible = false;
			cip_updatebtn.visible = true;
		}


		function showCrisisListItemPanel(skillid, fromlist) {
			cip_fromlist = fromlist;
			cip_skillid = skillid;
			cip_isonlist = (fromlist) ||   (C.content.testIfSkillOnCrisisList(skillid));
			cip_modlabel.text = C.content.getText("module_" + C.content.getModuleForSkill(skillid) + "_title");
			cip_skillabel.text = C.content.getText("skill_" + skillid + "_title");
			cip_textarea.hintText = "xxx" + C.content.getText("crisislistitem_instruction_hinttext");
			cip_delbtn.title = C.content.getText("crisislistitem_button_delete");
			cip_addbtn.title = C.content.getText("crisislistitem_button_add");
			cip_updatebtn.title = C.content.getText("crisislistitem_button_update");
			cip_gotobtn.title = C.content.getText("crisislistitem_button_goto_" + (fromlist ? "skill" : "list"));
			cip_closebtn.title = C.content.getText("crisislistitem_button_close");
			if (cip_isonlist) {
				setCrisisListItemPanelToUpdate();
			} else {
				setCrisisListItemPanelToAdd();
			}
			//crisislistitempanel.animate({opacity:1});
			// NOANIM
			crisislistitempanel.visible = true;
		}
		pb.sub("/showcrisislistitempanel", function(skillid, fromlist) {
			showCrisisListItemPanel(skillid, fromlist);
		});
		return crisislistitempanel;
	};
//});
