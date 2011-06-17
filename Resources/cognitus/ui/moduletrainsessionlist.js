C.ui.createModuleTrainSessionListView = function(o){
	var view = C.ui.createPage({}), pageargs;
	var newbtn = C.ui.createButton({
		top: 50,
		title: "new!"
	});
	newbtn.addEventListener("click",function(){
		pb.pub("/navto","moduletrainsession",C.state.lastArgs);
	});
	view.add(newbtn);
	view.add(C.ui.createLabel("moduletrainsessionlist_label",{
		top: 80,
		height: 20
	}));
	var table = Ti.UI.createTableView({
		top: 100
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
		newbtn.title = C.content.getText("moduletrainsessionlist_btn_new");
		Ti.API.log(C.content.getModuleQuizSessions(args.ModuleId));
		table.setData(C.content.getModuleQuizSessions(args.ModuleId).map(function(q){
			return Ti.UI.createTableViewRow({
				height: rowheight,
				className: "session",
				title: q.quizdate,
				quizdate: q.quizdate
			});
		}));
		setTimeout(function(){table.height = table.data[0].rows.length * rowheight;},100);
	}
	
	return view;
};