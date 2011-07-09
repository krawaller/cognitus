C.ui.createCrisisView = function(){
	var view = C.ui.createPage({});
	
	view.add(C.ui.createLabel("crisis_gotolist",{
		top: 40,
		left: 20
	}));
	
	function stopEditing(){
		editing = false;
		dialtextfield.blur();
		updateButtons();
	}
	
	function startEditing(){
		editing = true;
		updateButtons();
	}
	
	function updateButtons(){
		dialtextfield.visible = editing;
		dialbtn.visible = !editing;
		chosencrisislistid  = C.content.getCrisisList();
		dialtextfield.value = C.content.getCrisisNumber() || "";
		dialtextfield.hintText = C.content.getText("crisis_number_hinttext");
		editbtn.title = C.content.getText("crisis_btn_"+(editing ? "stopedit" : "startedit"));
		editbtn.image = Ti.Filesystem.resourcesDirectory+"/images/icons/"+(editing?"save":"edit")+".png";
		gotolistbtn.title = editing ? C.content.getText("crisis_btn_changelist") : chosencrisislistid ? C.content.getListTitle(chosencrisislistid) : C.content.getText("crisis_nolist");
		gotolistbtn.image = Ti.Filesystem.resourcesDirectory+"/images/icons/"+(editing ? "list" : "goto")+".png";
		gotolistbtn.opacity = chosencrisislistid ? 1 : 0.5;
		dialbtn.title = dialtextfield.value || C.content.getText("crisis_nonumber");
		dialbtn.opacity = dialtextfield.value ? 1 : 0.5;
	}
	
	var gotolistbtn = C.ui.createButton({
		top: 60,
		left:20,
		width: 160,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/goto.png",
		k_click: function(){
			if (!editing && chosencrisislistid){
				pb.pub("/navto","skillist",{ListId:chosencrisislistid});
			} else if (editing){
				pb.pub("/showselectlistmodal",[],function(listid){
					C.content.setCrisisList(listid);
					C.content.setCrisisNumber(dialtextfield.value);
					stopEditing();
				});
			}
		}
	});
	view.add(gotolistbtn);
	
	var editing = false;
	
	view.add(C.ui.createLabel("crisis_number",{
		top: 100,
		left: 20
	}));
	
	var dialbtn = C.ui.createButton({
		top: 120,
		left: 20,
		width: 160,
		k_click: function(){
			if (dialtextfield.value){
				Ti.Platform.openURL("tel:"+dialtextfield.value);
			}
		}
	});
	view.add(dialbtn);
	
	var dialtextfield = K.create({
		k_type: "TextField",
		top: 120,
		left: 20,
		height: 30,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		width: 160,
		keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,
		visible: false
	});
	view.add(dialtextfield);
	
	var editbtn = C.ui.createButton({
		top: 100,
		right: 20,
		width: 60,
		zIndex: 100,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/edit.png",
		k_click: function(){
			if (editing){
				C.content.setCrisisNumber(dialtextfield.value);
				stopEditing();
			} else {
				startEditing();
			}
		}
	});
	view.add(editbtn);
	
	var chosencrisislistid;
	view.render = function(){
		Ti.API.log("CRISIS RENDER!");
		stopEditing();
	};
	
	return view;
};