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
					left: 15
				},
				{
					k_type: "TextField",
					borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
					height: 30,
					width: 230,
					left: 15,
					visible: false,
					value: r.title,
					oldvalue: r.title
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
			//	C.content.removeList(e.row.ListId, e.row.priority);
			},
			move: function(e) {
				C.content.updateListPosition(e.row.ListId, e.index, e.fromIndex);
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
				table.editing = false;
				editing = false;
				btn.title = C.content.getText("crisislist_button_edit");
				table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
					setTimeout(function(){
						r.k_children[1].visible = false;
						r.k_children[0].visible = true;
					},300);
				});
			} else {
				if ((!table.data[0]) || (!table.data[0].rows) || (table.data[0].rows.length == 0)){
					C.ui.showMessage("Hey! Need to add rows first!");
					return;
				}
				editing = true;
				table.editing = true;
				btn.title = C.content.getText("crisislist_button_done");
				table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
					setTimeout(function(){
						r.k_children[0].visible = false;
						r.k_children[1].visible = true;
					},300);
				});
			}
		}
	});
	view.add(btn);

	view.render = function() {
		btn.title = C.content.getText("crisislist_button_" + (editing ? "done" : "edit"));
		renderTable();
	};
	return view;
};
