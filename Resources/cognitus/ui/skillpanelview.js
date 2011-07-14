(function(){
	C.ui.createSkillPanelView = function(){
		var panel = Ti.UI.createView({
			top: 0,
			height: 50,
			zIndex: 5,
			visible: 0
			//, backgroundColor: "green"
		});
		var listitembutton = C.ui.createButton({
			right: 10,
			width: 140,
			k_click: function(e){
				pb.pub("/showselectlistmodal",C.content.getListsIncludingSkill(C.state.lastArgs.SkillId),function(listid){
					pb.pub("/navto","skillist",{ListId: listid, addSkillId: C.state.lastArgs.SkillId});
				});
			},
			//title: "+"
			textid: "sys_addskilltolist_instruction",
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/add.png"
		});
		panel.add(listitembutton);
		
		var modulebutton = C.ui.createButton({
			left: 10,
			width: 140,
			image: Ti.Filesystem.resourcesDirectory+"/images/icons/goto.png",
			k_click: function(e){
				pb.pub("/navto","moduleskillist",{ModuleId:C.state.lastArgs.ModuleId});
			}
		});
		panel.add(modulebutton);
		
		pb.sub("/arrivedatnewpage",function(topage,args){
			if (topage.using === "skill"){
				var moduleid = args.ModuleId || C.content.getModuleForSkill(args.SkillId);
				modulebutton.title = C.content.getText("module_"+moduleid+"_title");
			}
		});
		
		return panel;
	};
})();