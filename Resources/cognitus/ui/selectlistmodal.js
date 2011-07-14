C.ui.createSelectListModal = function(){
	var cancelcb, selectcb;
	
	var modal = C.ui.createModal({
		onClose: function(){
			if (cancelcb){
				cancelcb();
			}
		}
	});
	
	var panel = modal.panel;

	pb.sub("/showselectlistmodal",function(excluded,a_selectcb,a_cancelcb){
		excluded = excluded.map(function(r){return r.ListId;});
		cancelcb = a_cancelcb;
		selectcb = a_selectcb;
		selectedrow = null;
		table.setData(C.content.getMyListsWithSkillCount().map(function(l){
			var x = excluded.indexOf(l.ListId) != -1;
			return C.ui.createTableViewRow({
				k_type: "TableViewRow",
				className: x ? "excluded" : "available",
				rightImage: x ? undefined : Ti.Filesystem.resourcesDirectory+"/images/icons/select.png",
				ListId: l.ListId,
				selected: false,
				listtitle: l.title,
				rowmainlabel: (x ? "(" : "")+l.title+" ("+l.skillcount+")"+(x?")":""),
				backgroundColor: x ? "#CCC" : "#FFF",
				excluded: x
			});
		}));
		modal.show();
	});
	
	var selectedrow;
	
	var table = K.create({
		k_type: "TableView",
		k_id: "table",
		top: 100,
		k_events: {
			click: function(e){
				Ti.API.log(["Clicked list!",e.row, e.row.ListId, e.row.excluded,selectedrow && selectedrow.ListId]);
				if (e.row && !e.row.excluded){
					selectcb(e.row.ListId);
					modal.close();
				}
			}
		}
	});
	panel.add(table)
	
	panel.add(C.ui.createLabel("selectlistmodal_instruction",{
		top:40
	}));
	
	return modal;
};