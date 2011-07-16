C.ui.createSkillListView = function() {
	var view = C.ui.createPage({});
	
	view.add(C.ui.createLabel("skillist_label_description",{
		top: 5,
		k_class: "descriptionlabel"
	}));
	
	var table = C.ui.createTableView({
		editable: true,
		moveable: true,
		top: 80,
		k_events: {
			"delete": function(e) {
				C.content.removeSkillFromList(e.row.ListItemId, e.row.priority);
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
		top: 25,
		left: 10,
		title: C.content.getText("skillist_btn_backtolists"),
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/goto.png",
		k_click: function(){
			pb.pub("/navto","mylists");
		}
	});
	view.add(listsbtn);
	
	var addbtn = C.ui.createButton({
		width: 110,
		top: 25,
		right: 90,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/add.png",
		k_click: function(){
			if (!editing){
				pb.pub("/showselectskillmodal",C.content.getListSkills(listid),function(skillid){
					C.content.addSkillToList(listid,skillid);
					renderTable();
					startEditing(true);
				});
			}
		}
	});
	view.add(addbtn);
	
	var editing = false;
	
	var editbtn = C.ui.createButton({
		height: 30,
		width: 70,
		top: 25,
		right: 10,
		zIndex: 5,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/edit.png",
		k_click: function() {
			if (editing) {
				stopEditing();
			} else {
				startEditing();
			}
		}
	});
	view.add(editbtn);
	
	var newtitleval,prevtitleval;
	pb.sub("/newtitleeditvalue",function(v){
		if (editing) {newtitleval = v;}
	});
	
	function stopEditing(){
		table.editing = false;
		editing = false;
		table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
			if (r.textfield.oldvalue != r.textfield.value){
				r.textfield.oldvalue = r.textfield.value;
				C.content.updateSkillUsageText(r.ListItemId,r.textfield.value);
			}
		});
		setTimeout(function(){
			renderTable();
		},300);
		if (newtitleval !== prevtitleval){
			C.content.updateListTitle(listid,newtitleval);
			pb.pub("/setnewtitle",newtitleval);
		}
		pb.pub("/hidetitleedit");
		updateButtons();
	}
	
	function startEditing(focusfirst){
		/*if (!(table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length)){
			C.ui.showMessage("need items!","error"); // TODO - lang!
			return;
		}*/
		prevtitleval = C.content.getListTitle(listid);
		newtitleval = prevtitleval;
		pb.pub("/showtitleedit",prevtitleval,C.content.getText("mylists_field_namehint"));
		editing = true;
		table.editing = true;
		table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
			setTimeout(function(){
				/*r.k_children.modulelabel.visible = false;
				r.k_children.skillabel.visible = false;*/
				r.visible = false; 
				r.textfield.visible = true;
				if (!i && focusfirst){
					setTimeout(function(){
						r.textfield.focus();
					},50);
				}
			},300);
		});
		updateButtons();
	}
	
	function updateButtons(){
		editbtn.title = C.content.getText("skillist_btn_" + (editing ? "done" : "edit"));
		editbtn.image = Ti.Filesystem.resourcesDirectory+"/images/icons/"+(editing?"save":"edit")+".png";
		listsbtn.title = C.content.getText("skillist_btn_backtolists");
		//editbtn.opacity = (table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length ? 1 : 0.5);
		addbtn.title = C.content.getText("skillist_btn_addskill");
		addbtn.opacity = (editing ? 0.5 : 1);
		addbtn.visible = !isprelist;
		editbtn.visible = !isprelist;
	}
	
	function createRow(r,i){
		var row = C.ui.createTableViewRow({
			rightImage: Ti.Filesystem.resourcesDirectory+"/images/icons/goto.png",
			SkillId: r.SkillId,
			ModuleId: r.ModuleId,
			ListItemId: r.ListItemId,
			priority: r.priority,
			height: 60
		});
		var toplabelcontainer = Ti.UI.createView({top: 0,height: 22,layout:"horizontal",width:"auto",left: 5});
		toplabelcontainer.add(C.ui.createLabel(undefined,{
			k_class: "rowtopleftlabel",
			text: C.content.getText("module_"+r.ModuleId+"_title")+" -"
		}));
		toplabelcontainer.add(C.ui.createLabel(undefined,{
			k_class: "rowtoprightlabel",
			text: C.content.getText("skill_"+r.SkillId+"_title")
		}));
		row.add(toplabelcontainer);
		row.toplabelcontainer = toplabelcontainer;
		var usagelabel = C.ui.createLabel(undefined,{
			k_class: "rowmainwrittenlabel",
			text: r.usagetext
		});
		row.add(usagelabel);
		row.usagelabel = usagelabel;
		var textfield = C.ui.createTextField({
			width: 230,
			k_id: "usagetextfield",
			hintText: C.content.getText("skillist_field_usagehint"),
			top: 20,
			left: 15,
			visible: false,
			value: r.usagetext,
			oldvalue: r.usagetext,
			adjustscroll: true,
			containingView: view,
			containingTable: table,
			rowIndex: i
		});
		row.add(textfield);
		row.textfield = textfield;
		textfield.index = i;
		return row;
	}
	
	function renderTable(){
		table.setData((isprelist ? C.content.getPreListSkills(listid,C.state.lang) : C.content.getListSkills(listid)).map(createRow));
	}
	
	var listid, 
		isprelist;
		
	view.render = function(args){
		listid = args.ListId;
		isprelist = !!(listid.match(/PRELIST/));
		if (editing){
			stopEditing();
		}
		if (args.addSkillId){
			C.content.addSkillToList(listid,args.addSkillId);
			renderTable();
			updateButtons();
			startEditing(true);
		} else {
			renderTable();
			updateButtons();
		}
	};
	
	return view;
};
