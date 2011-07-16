C.ui.createSelectSkillModal = function(){
	var cancelcb, selectcb;
	
	var modal = C.ui.createModal({
		onClose: function(){
			if (cancelcb){
				cancelcb();
			}
		}
	});
	
	pb.sub("/showselectskillmodal",function(excluded,a_selectcb,a_cancelcb){
		excluded = excluded.map(function(r){return r.SkillId;});
		cancelcb = a_cancelcb;
		selectcb = a_selectcb;
		selectedrow = null;
		var lastoffset = 50, totaloffset = 50;
		table.render(undefined,excluded,true);
		modal.show();
	});
	
	var selectedrow;
	
	var panel = modal.panel;
	
	function click(skillid){
		selectcb(skillid);
		modal.close();
	}
	
	var table = C.ui.createSkillTable({top:50,left: 0},click);
	panel.add(table);
	
	panel.add(C.ui.createLabel("selectskillmodal_instruction",{top:10}));
	
	return modal;
};