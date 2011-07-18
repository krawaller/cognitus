C.ui.createHistoryModal = function(){
	
	function renderTable(){
		table.setData(C.state.history.reverse().map(function(r){
			return C.ui.createTableViewRow(K.merge(C.state.historyposition === r.historyposition? {
				className: "currentRow",
				k_class: "markedrow"
			}:{
				k_class: "available",
				rightImage: "images/icons/goto_button.png"
			},{
				historyposition: r.historyposition,
				args: r.args,
				titles: r.titles,
				rowtoplabel: r.titles.sup,
				rowmainlabel: r.titles.main
			}));
		}));
		C.state.history.reverse(); // put it back! :)
	}
	
	
	var modal = C.ui.createModal({helptextid:"historymodal_help"});

	pb.sub("/showhistorymodal",function(){
		renderTable();
		modal.show();
	});
	
	var table = K.create({
		top: 80,
		k_type: "TableView",
		k_click: function(e){
			Ti.API.log([e.row.args,e.row.historyposition,e.row.titles]);
			if (e.row.historyposition !== C.state.historyposition){
				var to = C.state.history[C.state.historyposition = e.row.historyposition];
				pb.pub("/navto",to.pageid,K.merge({dontadjusthistory:true},to.args));
				modal.close();
			}
		}
	});
	modal.panel.add(table);
	modal.panel.add(C.ui.createLabel("historymodal_label_instruction",{
		top: 40
	}));

	return modal;
};