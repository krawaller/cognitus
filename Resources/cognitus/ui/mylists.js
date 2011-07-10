C.ui.createMyListsView = function(o) {
	
	var crisislistid;
	
	function renderTable() {
		table.setData(C.content.getMyListsWithSkillCount().map(function(r, i) {
			var row = C.ui.createTableViewRow({
				rightImage: Ti.Filesystem.resourcesDirectory+"/images/icons/goto.png",
				list: r,
				ListId: r.ListId,
				priority: r.priority,
				k_children: [{
					k_type: "Button",
					k_id: "crisisbutton",
					height: 25,
					width: 25,
					right: 15,
					top: 10,
					visible: r.ListId === crisislistid,
					enabled: false,
					ListId: r.ListId,
					title: r.ListId === crisislistid ? "K" : "-",
					k_click: function(e){
						crisislistid = e.source.ListId;
						C.content.setCrisisList(e.source.ListId);
						table.data[0].rows.forEach(function(r){
							r.k_children.crisisbutton.title = r.ListId === crisislistid ? "K" : "-";
						});
					}
				}]
			});
			var mainlabel = C.ui.createLabel(undefined,{
				k_class: "rowmainlabel",
				text: r.title + " (" + r.skillcount + ")",
			});
			row.add(mainlabel);
			row.mainlabel = mainlabel;
			
			var textfield = C.ui.createTextField({
				width: 195,
				left: 15,
				bottom: 5,
				visible: false,
				hintText: C.content.getText("mylists_field_namehint"),
				value: r.title,
				oldvalue: r.title,
				visible: false
			});
			row.add(textfield);
			row.textfield = textfield;
			
			return row;
		}));
	}

	var view = C.ui.createPage({});
	
	view.add(C.ui.createLabel("mylists_label_description",{top:3,k_class:"descriptionlabel"}));
	
	var table = C.ui.createTableView({
		editable: true,
		moveable: true,
		top: 60,
		k_events: {
			"delete": function(e) {
				C.content.removeList(e.row.ListId, e.row.priority);
				Ti.API.log("Deleting "+e.row.ListId+"!!");
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
		height: 30,
		width: 70,
		top: 25,
		left: 80,
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
	view.add(btn);

	var addbtn = C.ui.createButton({
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/add.png",
		width: 70, top: 25, right: 80, k_click: function(){
			if (!editing){
				C.content.addNewList();
				renderTable();
				startEditing(true);
			}
		}
	});
	view.add(addbtn);
	
	function stopEditing(){
		table.editing = false;
		editing = false;
		table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
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
		if ((!table.data[0]) || (!table.data[0].rows) || (table.data[0].rows.length == 0)){
			C.ui.showMessage("Hey! Need to add rows first!");
			return;
		}
		editing = true;
		table.editing = true;
		table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
			setTimeout(function(){
				r.mainlabel.visible = false;
				r.textfield.visible = true;
				r.k_children.crisisbutton.visible = true;
				r.k_children.crisisbutton.enabled = true;
				if (added && !i){
					r.k_children[1].focus();
				}
			},300);
		});
		updateButtons();
	}

	function updateButtons(){
		btn.title = C.content.getText("mylists_btn_" + (editing ? "done" : "edit"));
		btn.image = Ti.Filesystem.resourcesDirectory+"/images/icons/"+ (editing ? "save" : "edit") +".png";
		btn.opacity = (table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length ? 1 : 0.5);
		addbtn.title = C.content.getText("mylists_btn_newlist");
		addbtn.opacity = (editing ? 0.5 : 1);
		// TODO - also update hinttext?
	}

	view.render = function() {
		crisislistid = C.content.getCrisisList();
		renderTable();
		updateButtons();
	};
	return view;
};
