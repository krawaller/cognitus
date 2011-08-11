(function(){
	C.ui.createLanguageSelectModal = function(){
		function choose(l){
			C.state.lang = l;
			pb.pub("/updatetext");
			Ti.App.Properties.setString("chosenlanguage",l);
			modal.close();
		}
		var modal = C.ui.createModal({noclose:true}), panel = modal.panel;
		var english = Ti.UI.createImageView({
			width: 120, height: 120, top: 40, image: "images/usaflag.png" // backgroundColor: "red"//
		});
		english.addEventListener("click",function(){choose("en");});
		panel.add(english);
		var swedish = Ti.UI.createImageView({
			width: 120, height: 120, top: 200, image: "images/swedishflag.png" // backgroundColor: "green"
		});
		swedish.addEventListener("click",function(){choose("sv");});
		panel.add(swedish);	
		return modal;
	};
})();