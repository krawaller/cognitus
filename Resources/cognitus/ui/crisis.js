C.ui.createCrisisView = function(){
	var view = C.ui.createPage({});
	
	view.add(C.ui.createLabel("crisis_gotolist",{
		top: 60,
		left: 20
	}));
	
	var gotolistbtn = C.ui.createButton({
		top: 80,
		left:20,
		width: 160,
		k_click: function(){
			if (chosencrisislistid){
				pb.pub("/navto","skillist",{ListId:chosencrisislistid});
			}
		}
	});
	view.add(gotolistbtn);
	
	var gotolistslistbtn = C.ui.createButton({
		top: 140,
		left:20,
		width: 160,
		k_click: function(){
			pb.pub("/navto","mylists");
		}
	});
	view.add(gotolistslistbtn);
	
	view.add(C.ui.createLabel("crisis_number",{
		top: 200,
		left: 20
	}));
	
	var dialbtn = C.ui.createButton({
		top: 220,
		left: 20,
		width: 160,
		k_click: function(){
			if (chosencrisisnumber){
				Ti.Platform.openURL("tel:"+chosencrisisnumber);
			}
		}
	});
	view.add(dialbtn);
	
	
	var chosencrisislistid,chosencrisisnumber;
	view.render = function(){
		chosencrisislistid  = Ti.App.Properties.getString("crisislistid");
		chosencrisisnumber = Ti.App.Properties.getInt("crisisnumber");
		gotolistbtn.title = chosencrisislistid ? C.content.getListTitle(chosencrisislistid) : C.content.getText("crisis_nolist");
		gotolistslistbtn.title = C.content.getText("crisis_btn_seealllists");
		gotolistbtn.opacity = chosencrisislistid ? 1 : 0.5;
		dialbtn.title = chosencrisisnumber ? chosencrisisnumber : C.content.getText("crisis_nonumber");
		dialbtn.opacity = chosencrisisnumber ? 1 : 0.5;
	};
	
	return view;
};