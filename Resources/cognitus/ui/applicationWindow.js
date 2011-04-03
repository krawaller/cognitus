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
				C.ui.createSkillsView(),
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
		pb.sub("/mainFilmStrip/animateTo",function(role){
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
			k_children: [{
				k_class: "TitleLabel"
			}]
		}), titlelabel = titleview.k_children[0];
		win.add(titleview);
		pb.sub("/newtitle",function(title){
			titleview.animate({transform:Ti.UI.create2DMatrix().scale(1,0.1)},function(){
				titlelabel.text = title;
				titleview.animate({transform:Ti.UI.create2DMatrix().scale(1,1)});
			});
		});
		return win;
	};
})();