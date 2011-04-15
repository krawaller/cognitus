(function(){
	C.ui.createApplicationWindow = function(){
		var win = K.create({
			k_type: "Window",
			exitOnClose:true,
			orientationModes:[Ti.UI.PORTRAIT],
			fullscreen:true
		});
		var filmstrip = C.ui.createFilmStrip({
			ViewId:"mainFilmStrip",
			views: [
				C.ui.createSkillsTab(),
				C.ui.createCrisisView()
			]
		});
		var root = C.ui.createRoot(filmstrip);
		win.add(root);
		pointer = K.create({
			k_type: "View",
			width: 10,
			backgroundColor: "#000",
			bottom: 0,
			height: 50,
			left: 30
		});
		win.add(pointer);
		["skills","crisis"].forEach(function(label,i){
			var btn = K.create({
				k_class: "NavButtonView",
				width: 50,
				bottom:10,
				left: 10 + i*60,
				k_children: [{
					k_class: "NavButtonLabel",
					text: label.substr(0,3)
				}],
				k_click: function(e){
					pb.pub("/navto",filmstrip.views[i].ViewId);
				}
			});
			win.add(btn);
		});
		pb.sub("/mainFilmStrip/switchTo",function(role,animated){
			pointer.animate({left:role*60+30});
		});
		var titleview = K.create({
			k_type: "View",
			height: 30,
			top: 10,
			width: 200,
			left: 10,
			borderWidth: 1,
			borderColor: "#000",
			backgroundColor: "#CCC",
			k_children: [{
				k_class: "TitleLabel"
			}]
		}), titlelabel = titleview.k_children[0];
		win.add(titleview);
		function updateTitle(noanim){
			var title = C.state.currentTitle;
			if (titlelabel.text !== title){
				if (noanim === true){
					titlelabel.text = title;
				} else {
					titleview.animate({transform:Ti.UI.create2DMatrix().scale(1,0.1)},function(){
						titlelabel.text = title;
						titleview.animate({transform:Ti.UI.create2DMatrix().scale(1,1)});
					});
				}
			}
		}
		pb.sub("/newtitle",updateTitle);
		pb.sub("/updatetext",updateTitle,true);
		var langtest = K.create({
			k_class: "NavButtonView",
			width: 50,
			bottom:10,
			right: 10,
			k_children: [{
				k_class: "NavButtonLabel",
				text: "lang"
			}],
			k_click: function(e){
				C.state.lang = (C.state.lang == "en" ? "sv" : "en");
				C.state.currentTitle = C.content.getText(C.state.currentPage.ViewId+"_title");
				pb.pub("/updatetext");
			}
		});
		win.add(langtest);
		
		// note field
		var noteview = (function(){
			var view = K.create({
				k_type:"View",
				backgroundColor: "rgba(0,0,0,0.8)",
				opacity:0,
				k_children:[{
					k_type: "View",
					k_id: "noteview",
					backgroundColor: "#FFF",
					borderWidth: 1,
					borderColor: "#000",
					height: 400,
					width: 240,
					top: 20,
					k_children:[{
						k_id:"label",
						text: "---",
						top:30,
						height:20
					},{
						k_id:"textfield",
						k_type: "TextArea",
						width: 200,
						height: 200,
						top: 60,
						borderWidth: 1,
						value: "mooo",
						borderColor: "#000",
						left: 20,
						k_events: {
							blur: function(e){
								C.content.setNote(C.state.currentTitle,e.value);
							}
						}
					}]
				}]}),
			label = view.k_children.noteview.k_children.label,
			textfield = view.k_children.noteview.k_children.textfield,
			visible = 0;

			pb.sub("/makenote",function(){
				if (visible){
					visible = 0;
					view.animate({opacity:0});
				}
				else {
					visible = 1;
					view.animate({opacity:1});
					label.text = C.content.getText("note_instruction")+" "+C.state.currentTitle;
					textfield.value = C.content.getNote(C.state.currentTitle);
				}
			});

			view.add(label);

			return view;
		})();
		reportbtn = K.create({
			k_class: "NavButtonView",
			width: 30,
			bottom: 50,
			right: 10,
			k_children: [{
				k_class: "NavButtonLabel",
				text: "!!!"
			}],
			k_click: function(e){
				pb.pub("/makenote");
			}
		});
		win.add(noteview);
		win.add(reportbtn);
		return win;
	};
})();