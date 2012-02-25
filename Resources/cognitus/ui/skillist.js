C.ui.createSkillListView = function() {
	var view = C.ui.createPage({});
	
	//view.add(C.ui.createLabel("skillist_label_description",{top: 5,k_class: "descriptionlabel"}));
	
	var table = C.ui.createTableView({
		editable: true,
		moveable: true,
		top: 90,
		bottom: 0,
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
		width: 120,
		top: 10,
		left: 10,
		title: C.content.getText("skillist_btn_backtolists"),
		image: "/images/icons/goto.png",
		k_click: function(){
			pb.pub("/navto","mylists");
		}
	});
	view.add(listsbtn);
	
	var editing = false;
	
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
		if (!isprelist){
			C.utils.setButtonText(editbtn,C.content.getText("skillist_btn_" + (editing ? "done" : "edit")));
			C.utils.setButtonIcon(editbtn,"/images/icons/"+(editing?"save":"edit")+".png");
			C.utils.setButtonText(listsbtn,C.content.getText("skillist_btn_backtolists"));
			//editbtn.opacity = (table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length ? 1 : 0.5);
			C.utils.setButtonText(addbtn,C.content.getText("skillist_btn_addskill"));
			C.utils.setButtonState(addbtn,!editing);
			var crisislist = C.content.getCrisisList();
			C.utils.setButtonIcon(crisisbtn,"/images/icons/"+(listid === crisislist ? "skull_plain":"noskull2_plain")+".png");
			C.utils.setButtonText(crisisbtn,C.content.getText("skillist_btn_"+(crisislist===listid?"dontuseforcrisis":"useforcrisis")));
			Ti.API.log("updatebuttons","Ok. isprelist "+isprelist+","+addbtn.visible+","+crisisbtn.visible+","+editbtn.visible+","+listsbtn.visible);
		}
	}
	
	function createRow(r,i){
		var row = C.ui.createTableViewRow({
			rightImage: "/images/icons/goto_button.png",
			SkillId: r.SkillId,
			ModuleId: r.ModuleId,
			ListItemId: r.ListItemId,
			priority: r.priority,
			height: 80
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
			//width: 240,
			//height: "50",
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
		
	var editbtn,
		addbtn,
		crisisbtn;
	
		
	view.render = function(args){
		listid = args.ListId;
		isprelist = !!(listid.match(/PRELIST/));
		if (!isprelist){
			if (!editbtn){
				editbtn = C.ui.createButton({
					width: 120,
					top: 50,
					right: 10,
					zIndex: 5,
					//backgroundImage: "images/button32.png",
					//backgroundLeftCap: 5,
					k_click: function() {
						if (editing) {
							stopEditing();
						} else {
							startEditing();
						}
					}
				});
				view.add(editbtn);
			}
			if (!addbtn){
				addbtn = C.ui.createButton({
					width: 170,
					top: 50,
					left: 10,
					image: "/images/icons/add.png",
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
			}
			if (!crisisbtn){
				crisisbtn = C.ui.createButton({
					top: 10,
					right: 10,
					width: 170,
					k_click: function(){
						Ti.App.Properties.setString("crisislistid",listid === C.content.getCrisisList() ? "" : listid);
						updateButtons();
					}
				});
				view.add(crisisbtn);
			}
			
		}
		table.top = isprelist ? 50 : 90;
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
