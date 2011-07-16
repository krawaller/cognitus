C.ui.createModuleTrainSessionView = function(o){
	var view = C.ui.createPage({}),
		table = C.ui.createTableView({top: 70});
	view.add(table);
	//view.add(C.ui.createLabel("moduletrainsession_label_description",{top:10,k_class:"descriptionlabel"}));
	
	var savebtn = C.ui.createButton({
		textid: "moduletrainsession_btn_save",
		title:"MOO!", right: 20, width: 120, top: 25,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/save.png"
	});
	savebtn.addEventListener("click",function(e){
		var answers = [],
			quizdate = old ? C.state.lastArgs.quizdate : K.dateFormat(Date(),"yyyy-mm-dd HH:MM:ss");
		table.data[0].rows.forEach(function(r){
			answers.push({
				value: r.control.value,
				quizquestionid: r.quizquestionid
			});
		});
		C.content.storeQuizSession(quizdate,answers);
		C.ui.showMessage("moduletrainsession_msg_"+(old?"updated":"storednew"));
		pb.pub("/navto","moduletrainsessionlist");
	});
	view.add(savebtn);
	
	var backbtn = C.ui.createButton({
		textid: "moduletrainsession_btn_backtolist",
		left: 20,
		width: 120,
		top: 25,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/goto.png"
	});
	backbtn.addEventListener("click",function(){
		pb.pub("/navto","moduletrainsessionlist");
	});
	view.add(backbtn);
	
	var old;
	view.render = function(args){
	    old = (args.quizdate !== "NEW");
		pb.pub("/setnewtitle", old ? args.quizdate : C.content.getText("moduletrainsession_title_new"),C.content.getText("module_"+args.ModuleId+"_title"));
		questions = !old ? C.content.getModuleQuestions(args.ModuleId) : C.content.getQuizSessionAnswers(args.quizdate);
		var rowheight = 80;
		table.setData(questions.map(function(q){
			var control, r = Ti.UI.createTableViewRow({
				className: q.type + q["help"+C.state.lang] ? "withhelp" : "",
				height: rowheight,
				quizquestionid: q.quizquestionid
			});
			r.add(C.ui.createLabel(undefined,{
				text: q[C.state.lang],
				right: 20,
				height: 20,
				top: 5,
				k_class: "quizquestionlabel"
			}));
			if (q["help"+C.state.lang]){
				var helpbtn = C.ui.createButton({
					height: 30, width: 30, top: 25, right: 5, image: Ti.Filesystem.resourcesDirectory+"/images/icons/information.png",
					k_click: function(){
						pb.pub("/showhelpmodal","<h3>"+q[C.state.lang]+"</h3>"+q["help"+C.state.lang]);
					}
				});
				r.add(helpbtn);
			}
			switch(q.type){
				case "slider": 
					control = Ti.UI.createSlider({height: 20, min: 1, max: 10, left: 15, right: 50,k_class:"quizslider"});
					break;
				case "switch":
					control = Ti.UI.createSwitch({height: 30, width: 40, value: false,k_class:"quizswitch"});
					break;
				case "textfield":
					control = C.ui.createTextField({height: 35, left: 15, right: 50, adjustscroll:true,containingTable:table,containingView:view });
			}
			control.top = 35;
			r.control = control;
			r.add(control);
			if (old){
				control.value = q.value;
				//control.enabled = false;
			}
			return r;
		}));
		setTimeout(function(){table.height = table.data[0].rows.length * rowheight;},100);
	};
	return view;
};