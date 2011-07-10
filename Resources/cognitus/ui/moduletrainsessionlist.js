C.ui.createModuleTrainSessionListView = function(o){
	var view = C.ui.createPage({}), pageargs;
	var newbtn = C.ui.createButton({
		top: 30,
		width: 120,
		left: 20,
		textid: "moduletrainsessionlist_btn_new",
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/add.png"
	});
	function startEditing(){
		savebtn.visible = true;
		deletebtn.visible = false;
		table.editing = true;
	}
	function stopEditing(){
		deletebtn.visible = true;
		savebtn.visible = false;
		table.editing = false;
	}
	var deletebtn = C.ui.createButton({
		top: 30,
		width: 120,
		right: 20,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/edit.png",
		textid: "moduletrainsessionlist_btn_delete"
	});
	var savebtn = C.ui.createButton({
		top: 30,
		width: 120,
		right: 20,
		visible: false,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/save.png",
		textid: "moduletrainsessionlist_btn_done"
	});
	newbtn.addEventListener("click",function(){
		pb.pub("/navto","moduletrainsession",{quizdate:"NEW",ModuleId:C.state.lastArgs.ModuleId});
	});
	deletebtn.addEventListener("click",function(){
		startEditing();
	});
	savebtn.addEventListener("click",function(){
		stopEditing();
	});
	view.add(savebtn);
	view.add(deletebtn);
	view.add(newbtn);
	view.add(C.ui.createLabel("moduletrainsessionlist_label",{
		top: 0
	}));
	var table = C.ui.createTableView({
		top: 60,
		editable: true
	});
	table.addEventListener("delete",function(e){
		C.content.deleteQuizSession(e.row.quizdate);
	});
	table.addEventListener("click",function(e){
		Ti.API.log([e,e.row,e.rowData]);
		if (e.row){
			pb.pub("/navto","moduletrainsession",{quizdate:e.row.quizdate,ModuleId:C.state.lastArgs.ModuleId});
		}
	});
	view.add(table);
	
	
	view.render = function(args){
		var rowheight = 50;
		Ti.API.log(C.content.getModuleQuizSessions(args.ModuleId));
		table.setData(C.content.getModuleQuizSessions(args.ModuleId).map(function(q){
			return C.ui.createTableViewRow({
				hasChild: true,
				height: rowheight,
				className: "session",
				rowmainlabel: q.quizdate,
				quizdate: q.quizdate
			});
		}));
		if (table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length){
			table.height = (table.data[0].rows.length+3) * rowheight;
		}
		stopEditing();
	};
	
	return view;
};