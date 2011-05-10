C.ui.createSkillListView = function() {
	var view = C.ui.createPage({});
	var table = K.create({
		k_type: "TableView",
		editable: true,
		moveable: true,
		top: 100,
		k_events: {
			"delete": function(e) {
				C.content.removeSkillFromList(e.row.ListItemId, e.row.priority);
				Ti.API.log("Deleting "+e.row.ListItemId+"!!");
			},
			move: function(e) {
				C.content.updateSkillPositionOnList(e.row.ListItemId, e.index, e.fromIndex);
			},
			click: function(e) {
				if (!editing) {
					pb.pub("/navto", "skillrational", {
						SkillId: e.row.SkillId
					});
				}
			}
		}
	});
	view.add(table);
	
	var listsbtn = C.ui.createButton({
		width: 70,
		top: 45,
		left: 10,
		title: C.content.getText("skillist_btn_backtolists"),
		k_click: function(){
			pb.pub("/navto","mylists");
		}
	});
	view.add(listsbtn);
	
	var addbtn = C.ui.createButton({
		width: 30,
		top: 45,
		right: 90,
		title: "+",
		k_click: function(){
			pb.pub("/showselectskillmodal",C.content.getListSkills(listid),function(skillid){
				C.content.addSkillToList(listid,skillid);
				renderTable();
				startEditing(true);
			});
		}
	});
	view.add(addbtn);
	
	var editing = false;
	
	var editbtn = C.ui.createButton({
		height: 30,
		width: 70,
		top: 45,
		right: 10,
		zIndex: 5,
		k_click: function() {
			if (editing) {
				stopEditing();
			} else {
				startEditing();
			}
		}
	});
	view.add(editbtn);
	
	function stopEditing(){
		table.editing = false;
		editing = false;
		table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
			if (r.k_children.usagetextfield.oldvalue != r.k_children.usagetextfield.value){
				r.k_children.usagetextfield.oldvalue = r.k_children.usagetextfield.value;
				Ti.API.log(["UPDATING LISTITEM TEXT!!! ",r.ListId,r.k_children.usagetextfield.value]);
				C.content.updateSkillUsageText(r.ListItemId,r.k_children.usagetextfield.value);
			}
		});
		setTimeout(function(){
			renderTable();
		},300);
		if (titletextfield.value !== titletextfield.oldvalue){
			C.content.updateListTitle(listid,titletextfield.value);
			Ti.API.log("Changing title from "+titletextfield.oldvalue+" to "+titletextfield.value);
			pb.pub("/updatetitle",titletextfield.value);
			titletextfield.oldvalue = titletextfield.value;
		}
		titletextfield.blur();
		titletextfield.visible = false;
		C.ui.showPageTitle();
		updateButtons();
	}
	
	var titletextfield = K.create({
		k_type: "TextField",
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		height: 30,
		width: 230,
		k_id: "titletextfield",
		top: 10,
		visible: false,
		zIndex: 5
	});
	view.add(titletextfield);
	
	function startEditing(focusfirst){
		/*if (!(table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length)){
			C.ui.showMessage("need items!","error"); // TODO - lang!
			return;
		}*/
		titletextfield.visible = true;
		C.ui.hidePageTitle();
		editing = true;
		table.editing = true;
		table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
			setTimeout(function(){
				r.k_children.modulelabel.visible = false;
				r.k_children.skillabel.visible = false;
				r.k_children.usagelabel.visible = false;
				r.k_children.usagetextfield.visible = true;
				if (!i && focusfirst){
					r.k_children.usagetextfield.focus();
				}
			},300);
		});
		updateButtons();
	}
	
	function updateButtons(){
		editbtn.title = C.content.getText("crisislist_button_" + (editing ? "done" : "edit"));
		//editbtn.opacity = (table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length ? 1 : 0.5);
		//addbtn.title = C.content.getText("mylists_btn_newlist");
		//addbtn.opacity = (editing ? 0.5 : 1);
	}
	
	function renderTable(){
		table.setData(C.content.getListSkills(listid).map(function(r,i){
			return K.create({
				hasChild: true,
				SkillId: r.SkillId,
				ModuleId: r.ModuleId,
				ListItemId: r.ListItemId,
				priority: r.priority,
				height: 60,
				k_type: "TableViewRow",
				k_children: [{
					k_type: "Label",
					k_id: "modulelabel",
					top: 0,
					left: 20,
					textAlign: "left",
					font: {
						fontSize: 10
					},
					text: C.content.getText("module_"+r.ModuleId+"_title")
				},{
					k_type: "Label",
					top: 12,
					left: 5,
					k_id: "skillabel",
					textAlign: "left",
					font: {
						fontSize: 15,
						fontWeight: "bold"
					},
					text: C.content.getText("skill_"+r.SkillId+"_title")
				},{
					k_type: "Label",
					top: 28,
					left: 40,
					height: 30,
					textAlign: "left",
					k_id: "usagelabel",
					width: $$.platformWidth,
					font: {
						fontSize: 12,
						fontStyle: "italic"
					},
					text: r.usagetext
				},	{
						k_type: "TextField",
						borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						height: 30,
						width: 230,
						k_id: "usagetextfield",
						top: 5,
						left: 15,
						visible: false,
						value: r.usagetext,
						oldvalue: r.usagetext,
						visible: false
				}]
			});
		}));
	}
	
	var listid; 
	view.render = function(args){
		listid = args.ListId;
		titletextfield.value = C.content.getListTitle(listid);
		titletextfield.oldvalue = titletextfield.value;
		renderTable();
		updateButtons();
	};
	
	return view;
};
