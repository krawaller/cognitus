C.ui.createCrisisView = function(){
	var view = C.ui.createPage({});
	
	view.add(C.ui.createLabel("crisis_gotolist",{
		k_class: "descriptionlabel",
		top: 30
	}));
	
	view.add(C.ui.createLabel("crisis_number",{
		k_class: "descriptionlabel",
		top: 130
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
		editbtn.image = "/images/icons/"+(editing?"save":"edit")+".png";
		gotolistbtn.title = editing ? C.content.getText("crisis_btn_changelist") : chosencrisislistid ? C.content.getListTitle(chosencrisislistid) : C.content.getText("crisis_nolist");
		gotolistbtn.image = "/images/icons/"+(editing ? "list" : "goto")+".png";
		gotolistbtn.opacity = editing || chosencrisislistid ? 1 : 0.5;
		dialbtn.title = dialtextfield.value || C.content.getText("crisis_nonumber");
		dialbtn.opacity = dialtextfield.value ? 1 : 0.5;
	}
	
	var gotolistbtn = C.ui.createButton({
		top: 50,
		width: 180,
		image: "/images/icons/goto.png",
		k_click: function(){
			if (!editing && chosencrisislistid){
				pb.pub("/navto","skillist",{ListId:chosencrisislistid});
			} else if (editing){
				pb.pub("/showselectlistmodal",[],function(listid){
					C.content.setCrisisList(listid);
					C.content.setCrisisNumber(dialtextfield.value);
					stopEditing();
				},undefined,chosencrisislistid||" ");
			}
		}
	});
	view.add(gotolistbtn);
	
	var editing = false;

	
	var dialbtn = C.ui.createButton({
		top: 150,
		width: 180,
		image: "/images/icons/dial_plain.png",
		k_click: function(){
			if (dialtextfield.value){
				Ti.Platform.openURL("tel:"+dialtextfield.value);
			}
		}
	});
	view.add(dialbtn);
	
	var dialtextfield = C.ui.createTextField({
		top: 150,
		width: 160,
		keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,
		visible: false
	});
	view.add(dialtextfield);
	
	var editbtn = C.ui.createButton({
		top: 230,
		width: 70,
		zIndex: 100,
		image: "/images/icons/edit.png",
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
		Ti.API.log("test","TESTING LOGGING");
		stopEditing();
	};
	
	return view;
};