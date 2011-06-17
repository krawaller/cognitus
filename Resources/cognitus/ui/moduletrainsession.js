C.ui.createModuleTrainSessionView = function(o){
	Ti.API.log("MDOASD");
	var view = C.ui.createPage({backgroundColor: "yellow"}),
		table = Ti.UI.createTableView({top: 60, bottom: 0});
	view.add(table);
	view.render = function(args){
		pb.pub("/updatetitle", "Ny session!",C.content.getText("module_"+args.ModuleId+"_title"));
		questions = C.content.getModuleQuestions(args.ModuleId);
		Ti.API.log(questions);
		var rowheight = 80,
			lastrow = Ti.UI.createTableViewRow({
				className:"lastRow",
				isLast:true,
				height: rowheight
			}),
			finishbtn = Ti.UI.createButton({
				title:"MOO!", left: 15, right: 15, height: 30, top: 20
			});
		lastrow.add(finishbtn);
		finishbtn.addEventListener("click",function(e){
			Ti.API.log([table.data,table.data[0],table.data[0].rows,table.data[0].rows.length,typeof table.data[0].rows,Array.isArray(table.data[0].rows),table.data[0].rows.each]);
			table.data[0].rows.forEach(function(r){
				if (!r.isLast){
					Ti.API.log([r.quizquestionid,typeof r.getVal, typeof r.control, r.control.value]);
				}
			});
		});
		table.setData(questions.map(function(q){
			var control, r = Ti.UI.createTableViewRow({
				className: q.type,
				height: rowheight,
				quizquestionid: q.quizquestionid
			});
			r.add(Ti.UI.createLabel({
				text: q[C.state.lang],
				left: 10,
				height: 20,
				top: 5
			}));
			switch(q.type){
				case "slider": 
					control = Ti.UI.createSlider({height: 20, min: 1, max: 10, left: 15, right: 15});
					break;
				case "switch":
					control = Ti.UI.createSwitch({height: 30, width: 40, value: false});
					break;
				case "textfield":
					control = Ti.UI.createTextField({height: 35, left: 15, right: 15, borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED });
			}
			control.top = 35;
			r.control = control;
			r.add(control);
			return r;
		}).concat(lastrow));
		setTimeout(function(){table.height = table.data[0].rows.length * rowheight;},100);
	};
	return view;
};