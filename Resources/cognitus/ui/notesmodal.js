C.ui.createNotesModal = function(){
	
	function close(){
		pb.pub("/hasnote",(textarea.value || "").length);
		view.visible = false;
	}
	
	var pagename;
	
	function show(){
		panel.left = 10;
		panel.right = 10;
		panel.bottom = 10;
		pagename = C.utils.currentPageName();
		textarea.value = C.content.getNoteForPage(pagename);
		view.visible = true;
	}
	
	var view = K.create({
		k_type: "View",
		backgroundColor: "rgba(0,0,0,0.8)",
		visible: false,
		zIndex: 150,
		k_id: "modal",
		k_click: function(e) {
			if (e.source.k_id === "modal") {
				close();
			}
		},
		k_children: [{
			k_type: "View",
			borderSize: 1,
			borderColor: "#000",
			backgroundColor: "#FFF",
			top: 20,
			left: 20,
			right: 20,
			bottom: 20,
		//	layout: "vertical",
			k_id: "panel",
			k_children: [{
				k_id: "note",
				k_type: "View",
			//	backgroundColor: "blue",
				k_children: [{
					k_type: "Label",
					height: 40,
					top: 40,
					text: C.content.getText("notesmodal_label_instruction")
				},{
					k_type: "TextArea",
					top: 140,
					bottom: 10,
					left: 10,
					right: 10,
					k_id: "textarea",
					borderWidth: 2
				}]
			},{
				k_id: "notelist",
				k_type: "View",
				backgroundColor: "red",
				visible: false
			}]
		}]
	});
	
	var panel = view.k_children.panel,
		note = panel.k_children.note,
		notelist = panel.k_children.notelist,
		textarea = note.k_children.textarea;
	
	var savebtn = C.ui.createButton({
		top: 90, right: 10, width: 70,
		textid: "notesmodal_btn_store"
	});
	note.add(savebtn);
	savebtn.addEventListener("click",function(e){
		C.content.saveNoteForPage(pagename,textarea.value);
		C.ui.showMessage("notesmodal_msg_stored","success");
	});
		
	
	var closebtn = C.ui.createButton({
		k_type: "Button",
		top: 10,
		height: 30,
		left: 10,
		width: 70,
		textid: "notesmodal_btn_close",
		k_click: close
	});
	panel.add(closebtn); 
	
	pb.sub("/shownotesmodal",show);
	
	return view;
};