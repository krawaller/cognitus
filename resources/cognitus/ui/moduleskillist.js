C.ui.createModuleSkillListView = function(o){
	var view = C.ui.createPage({});
	view.add( C.ui.createLabel("moduleskillist_description",{k_class:"descriptionlabel",top:5}) );
	
	function tableclick(skillid,moduleid){
		pb.pub("/navto","skillrational",{SkillId:skillid,ModuleId:moduleid});
	}
	
	var table = C.ui.createSkillTable({top:40},tableclick);
	view.add(table);
	view.render = function(arg){
		table.height = table.render(arg.ModuleId,[]);
	}
	
	/*var table = K.create({
		k_type: "TableView",
		top: 100,
		//style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		k_click: function(e){
			pb.pub("/navto","skillrational",{SkillId:e.row.SkillId,ModuleId:e.row.ModuleId});
		}
	});
	view.add(table);
	view.render = function(arg){
		table.setData(C.content.getSkillsForModule(arg.ModuleId).map(function(s){
			return {
				hasChild: true,
				SkillId: s,
				ModuleId: arg.ModuleId,
				title: C.content.getText("skill_"+s+"_title")
			};
		}));
	};*/
//	view.using = "ModuleId";
	return view;
};