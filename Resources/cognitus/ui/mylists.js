C.ui.createMyListsView = function(o) {
	
	var crisislistid;
	
	
	function createRow(r,i,locked){
		var row = C.ui.createTableViewRow({
			rightImage: "/images/icons/goto_button.png",
			list: r,
			ListId: r.ListId,
			locked: locked,
			priority: r.priority
		});
		var mainlabel = C.ui.createLabel(undefined,{
			k_class: "rowmainlabel",
			text: r.title + " (" + r.skillcount + ")"
		});
		row.add(mainlabel);
		row.mainlabel = mainlabel;
		
		if (!locked){
			var crisisbutton = K.create({
				k_type: "Button",
				width: 32,
				height: 32,
				right: 15,
				top: 10,
				zIndex: 1000,
				visible: r.ListId === crisislistid,
//				enabled: false,
				ListId: r.ListId,
				backgroundImage: "/images/icons/" + (r.ListId === crisislistid ? "skull_button.png" : "noskull2_button.png"),
				//title: r.ListId === crisislistid ? "K" : "-",
				k_click: function(e){
					crisislistid = e.source.ListId;
					C.content.setCrisisList(e.source.ListId);
					table.data[0].rows.forEach(function(r){
						r.crisisbutton.backgroundImage = "/images/icons/" + (r.ListId === crisislistid ? "skull_button.png" : "noskull2_button.png");
						//r.crisisbutton.title = r.ListId === crisislistid ? "K" : "-";
					});
				}
			});
			row.add(crisisbutton);
			row.crisisbutton = crisisbutton;

			var textfield = C.ui.createTextField({
				width: 185,
				left: 15,
				bottom: 10,
				visible: false,
				hintText: C.content.getText("mylists_field_namehint"),
				value: r.title,
				oldvalue: r.title,
				visible: false,
				adjustscroll: true,
				containingView: view,
				containingTable: table,
				rowIndex: i
			});
			row.add(textfield);
			row.textfield = textfield;
			textfield.index = i;
			textfield.row = row;
		}
		
		
		if (locked){
			row.editable = false;
			row.moveable = false;
		}
		return row;
	}
	function renderTable() {
		var prelists = Ti.UI.createTableViewSection({
			headerView: C.ui.createTableSectionHeader(C.content.getText("skillist_header_prelists")),
			editable: false,
			moveable: false
		});
		C.content.getPreListsWithDetails(C.state.lang).forEach(function(r,i){
			prelists.add(createRow(r,i,true));
		});
		var mylists = Ti.UI.createTableViewSection({
			headerView: C.ui.createTableSectionHeader(C.content.getText("skillist_header_mylists"))
		});
		C.content.getMyListsWithSkillCount().forEach(function(r,i){
			mylists.add(createRow(r,i));
		});
		table.setData([mylists,prelists]);
		//table.height = Math.max(400,20*2+rows*50);
		//table.setData((C.content.getMyListsWithSkillCount()/*C.content.getPreListsWithDetails(C.state.lang)*/).map(createRow));
	}

	var view = C.ui.createPage({});
	
	// view.add(C.ui.createLabel("mylists_label_description",{top:3,k_class:"descriptionlabel"}));
	
	var table = C.ui.createTableView({
		editable: true,
		moveable: true,
		top: 50,
		bottom: 0,
		k_events: {
			"delete": function(e) {
				C.content.removeList(e.row.ListId, e.row.priority);
			},
			move: function(e) {
				C.content.updateListPosition(e.row.ListId, e.index, e.fromIndex);
			},
			click: function(e){
				if (!editing){
					pb.pub("/navto","skillist",{ListId:e.row.ListId});
				}
			}
		}
	});
	view.add(table);

	var editing = false;
	var btn = C.ui.createButton({
		height: 32,
		width: 90,
		top: 10,
		left: 60,
		zIndex: 5,
		backgroundImage: "/images/button32.png",
		backgroundLeftCap: 5,
		k_click: function() {
			if (editing) {
				stopEditing();
			} else {
				startEditing();
			}
		}
	});
	view.add(btn);

	var addbtn = C.ui.createButton({
		image: "/images/icons/add_plain.png",
		width: 90, 
		height: 32,
		top: 10, 
		right: 60,
		backgroundImage: "/images/button32.png",
		backgroundLeftCap: 5, 
		k_click: function(){
			if (!editing){
				C.content.addNewList();
				renderTable();
				setTimeout(function(){startEditing(true)},200);
			}
		}
	});
	view.add(addbtn);
	
	function stopEditing(){
		table.editing = false;
		editing = false;
		table.data[0].rows.forEach(function(r,i){
			if (r.locked) return;
			if (r.textfield.oldvalue != r.textfield.value){
				r.textfield.oldvalue = r.textfield.value;
				C.content.updateListTitle(r.ListId,r.textfield.value);
			}
		});
		setTimeout(function(){
			renderTable();
		},300);
		updateButtons();
	}
	
	function startEditing(added){
		var mylistsection = table.data[0];
		if ((!mylistsection.rows) || (mylistsection.rows.length == 0)){
			C.ui.showMessage("mylists_msg_mustaddrowsfirst");
			return;
		}
		editing = true;
		table.editing = true;
		mylistsection.rows.forEach(function(r,i){
			if (r.locked) return;
			setTimeout(function(){
				r.mainlabel.visible = false;
				r.textfield.visible = true;
				r.crisisbutton.visible = true;
				if (added && !i){
					r.textfield.value = "";
					r.textfield.focus();
				}
			},300);
		});
		updateButtons();
	}

	function updateButtons(){
		C.utils.setButtonText(btn,C.content.getText("mylists_btn_" + (editing ? "done" : "edit")));
		C.utils.setButtonIcon(btn,"/images/icons/"+ (editing ? "done" : "edit") +"_plain.png");
		C.utils.setButtonState(btn,table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length);
		C.utils.setButtonText(addbtn,C.content.getText("mylists_btn_newlist"));
		C.utils.setButtonState(addbtn,!editing);
		// TODO - also update hinttext?
	}

	view.render = function() {
		crisislistid = C.content.getCrisisList();
		renderTable();
		updateButtons();
	};
	return view;
};
