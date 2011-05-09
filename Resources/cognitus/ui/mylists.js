C.ui.createMyListsView = function(o) {
	function renderTable() {
		table.setData(C.content.getMyListsWithSkillCount().map(function(r, i) {
			return K.create({
				k_type: "TableViewRow",
				list: r,
				ListId: r.ListId,
				priority: r.priority,
				k_children: [{
					k_class: "rowMainLabel",
					text: r.title + " (" + r.skillcount + ")",
					height: 30,
					width: 230,
					left: 15,
					visible: true
				},
				{
					k_type: "TextField",
					borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
					height: 30,
					width: 230,
					left: 15,
					bottom: 5,
					visible: false,
					value: r.title,
					oldvalue: r.title,
					visible: false
				}]
			});
		}));
	}

	var view = C.ui.createPage(o || {}),
		table = K.create({
		k_type: "TableView",
		editable: true,
		moveable: true,
		top: 100,
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
	view.add(btn);

	var addbtn = C.ui.createButton({
		width: 70, top: 45, right: 100, k_click: function(){
			C.content.addNewList();
			renderTable();
			startEditing(true);
		}
	});
	view.add(addbtn);
	
	function stopEditing(){
		table.editing = false;
		editing = false;
		table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
			if (r.k_children[1].oldvalue != r.k_children[1].value){
				r.k_children[1].oldvalue = r.k_children[1].value;
				C.content.updateListTitle(r.ListId,r.k_children[1].value);
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
				r.k_children[0].visible = false;
				r.k_children[1].visible = true;
				if (added && !i){
					r.k_children[1].focus();
				}
			},300);
		});
		updateButtons();
	}

	function updateButtons(){
		btn.title = C.content.getText("crisislist_button_" + (editing ? "done" : "edit"));
		btn.opacity = (table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length ? 1 : 0.5);
		addbtn.title = C.content.getText("mylists_btn_newlist");
		addbtn.opacity = (editing ? 0.5 : 1);
	}

	view.render = function() {
		renderTable();
		updateButtons();
	};
	return view;
};
