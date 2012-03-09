C.ui.createModuleTrainSessionListView = function(o){
	var view = C.ui.createPage({}), pageargs;
	var newbtn = C.ui.createButton({
		top: 30,
		width: 120,
		left: 20,
		textid: "moduletrainsessionlist_btn_new",
		image: "/images/icons/add.png"
	});
	function startEditing(){
		savebtn.visible = true;
		deletebtn.visible = false;
		table.editing = true;
		if (C.state.platform == "android"){
			table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
				setTimeout(function(){
					r.deletebutton.visible = true;
				},100);
			});
		}
	}
	function stopEditing(){
		deletebtn.visible = true;
		savebtn.visible = false;
		table.editing = false;
		if (C.state.platform == "android"){
			table.data && table.data[0] && table.data[0].rows && table.data[0].rows.forEach(function(r,i){
				setTimeout(function(){
					r.deletebutton.visible = false;
				},100);
			});
		}
	}
	var deletebtn = C.ui.createButton({
		top: 30,
		width: 120,
		right: 20,
		image: "/images/icons/edit.png",
		textid: "moduletrainsessionlist_btn_delete"
	});
	var savebtn = C.ui.createButton({
		top: 30,
		width: 120,
		right: 20,
		visible: false,
		image: "/images/icons/save.png",
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
	//view.add(C.ui.createLabel("moduletrainsessionlist_label",{top: 10}));
	var table = C.ui.createTableView({
		top: 70,
		editable: true
	});
	table.addEventListener("delete",function(e){
		C.content.deleteQuizSession(e.row.quizdate);
	});
	table.addEventListener("click",function(e){
		if (e.row && !e.source.btn && !e.source.iamadeletebutton){
			pb.pub("/navto","moduletrainsession",{quizdate:e.row.quizdate,ModuleId:C.state.lastArgs.ModuleId});
		} else if (C.state.platform == "android" && e.source.iamadeletebutton){
			C.ui.openConfirmDialogue(function(){
				C.content.deleteQuizSession(e.row.quizdate);
				table.deleteRow(e.index);
			});
		}
	});
	view.add(table);
	
	
	view.render = function(args){
		var rowheight = 50, numrows = 0;
		table.setData(C.content.getModuleQuizSessions(args.ModuleId).map(function(q){
			numrows++;
			var row= C.ui.createTableViewRow({
				//hasChild: true,
				rightImage: "/images/icons/goto_button.png",
				height: rowheight,
				className: "session",
				rowmainlabel: q.quizdate,
				quizdate: q.quizdate
			});
			if (C.state.platform == "android"){
				var deletebutton = C.ui.createTableViewRowDeleteButton({
					right: 49,
					ListId: row.ListId,
					top: 12
				});
				row.add(deletebutton);
				row.deletebutton = deletebutton;
			}
			var mailbtn = C.ui.createButton({
				top: 10,
				btn: true,
				right: 10,
				width: 32,
				backgroundImage: "/images/icons/mail.png",
				k_click: function(e){
					var headline = C.content.getText("moduletrainsession_training")+" "+C.content.getText("module_"+args.ModuleId+"_title")+" "+q.quizdate,
						html = "<h2>"+headline+"</h2><dl>",
						answers =  C.content.getQuizSessionAnswers(q.quizdate);
					answers.forEach(function(a){
						html += "<dt>"+a[C.state.lang]+"</dt>";
						html += "<dd>"+a.value+"</dd>";
					});
					html += "</dl>";
					Ti.API.log(html);
					Titanium.UI.createEmailDialog({
						subject: "Cognitus Application - "+headline,
						messageBody: html,
						html: true,
					}).open();
				}
			});
			row.add(mailbtn);
			return row;
		}));
		if (table.data && table.data[0] && table.data[0].rows && table.data[0].rows.length){
			table.height = (table.data[0].rows.length+3) * rowheight;
		}
		stopEditing();
		deletebtn.visible = !!numrows;
	};
	
	return view;
};