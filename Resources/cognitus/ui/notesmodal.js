C.ui.createNotesModal = function(){
	
	function close(){
		pb.pub("/hasnote",(textarea.value || "").length);
		view.visible = false;
	}
	
	var originalnotepagename, currentnotepagename, currentnoteargs, nonotefororiginal;
	
	function show(){
		panel.left = 10;
		panel.right = 10;
		panel.bottom = 10;
		originalnotepagename = C.utils.currentPageName();
		usernote = C.content.getNoteForPage(originalnotepagename);
		nonotefororiginal = !usernote;
		title = C.utils.pageNameToTitle(originalnotepagename);
		setNote({
			pageid: C.state.currentPageId,
			pagename: originalnotepagename,
			note: usernote,
			titlemain:title.main,
			titlesup:title.sup,
			args: C.state.lastArgs
		});
		view.visible = true;
	}
	
	function setNote(o){
		note.visible = true;
		notelist.visible = false;
		currentnotepagename = o.pagename;
		currentnotepageid = o.pageid;
		gotobtn.visible = (currentnotepagename !== originalnotepagename);
		currentnoteargs = o.args;
		textarea.value = o.note;
		titlesuplabel.text = o.titlesup;
		titlemainlabel.text = o.titlemain;
	}
	
	function showList(){
		stopEdit();
		updateTable();
		note.visible = false;
		notelist.visible = true;
		textarea.blur();
	}
	
	function updateTable(){
		var listofnotes = C.content.getNoteList();
		Ti.API.log(listofnotes);
		table.setData(listofnotes.map(function(n){
			var title = C.utils.pageNameToTitle(n.pagename),
				a = C.utils.pageNameToArgs(n.pagename),
				pageid = a[0],
				args = a[1];
			return C.ui.createTableViewRow({
				hasChild: true,
				//title: (title.sup?title.sup+" - ":"")+title.main,
				pagename: n.pagename,
				titlemain: title.main,
				titlesup: title.sup,
				args: args,
				pageid: pageid,
				note: n.note,
				rowtoplabel: title.sup,
				rowmainlabel: title.main
			});
		}));
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
		/*	top: 20,
			left: 20,
			right: 20,
			bottom: 20,*/
		//	layout: "vertical",
			k_id: "panel",
			k_children: [{
				k_id: "note",
				k_type: "View",
				bottom: 0,
				top: 0,
			//	backgroundColor: "blue",
			},{
				k_id: "notelist",
				k_type: "View",
				visible: false
			}]
		}]
	});
	
	var panel = view.k_children.panel,
		note = panel.k_children.note,
		notelist = panel.k_children.notelist;

	var textarea = C.ui.createTextArea({
		top: 160, bottom: 50, left: 10, right: 10
	});
	note.add(textarea);

	var table = C.ui.createTableView({top:110});
	notelist.add(table);

	
	var titlesuplabel = C.ui.createLabel(undefined,{
		top: 110, k_class: "inpagesuptitlelabel"
	});
	note.add(titlesuplabel);
	
	var titlemainlabel = C.ui.createLabel(undefined,{
		top: 125, k_class: "inpagemaintitlelabel"
	});
	note.add(titlemainlabel)
	
	var gotobtn = C.ui.createButton({
		top: 70, left: 10, width: 120,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/goto.png",
		textid: "notesmodal_btn_goto"
	});
	note.add(gotobtn);
	gotobtn.addEventListener("click",function(e){
		view.visible = false;
		if (currentnotepagename !== originalnotepagename){
			pb.pub("/navto",currentnotepageid,currentnoteargs);
		}
	});
	
	
	var savebtn = C.ui.createButton({
		bottom: 10, right: 10, width: 70,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/save.png",
		textid: "notesmodal_btn_store"
	});
	note.add(savebtn);
	savebtn.addEventListener("click",function(e){
		C.content.saveNoteForPage(currentnotepagename,textarea.value);
		if (textarea.value){
			C.ui.showMessage("notesmodal_msg_stored","success");
		} else {
			C.ui.showMessage("notesmodal_msg_cleared","success");
		}
	});
	
	var seelistbtn = C.ui.createButton({
		top: 70, right: 10, width: 120,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/list.png",
		textid: "notesmodal_btn_seelist"
	});
	note.add(seelistbtn);
	seelistbtn.addEventListener("click",function(e){
		showList();
	});
	
	notelist.add(C.ui.createLabel("notesmodal_label_list",{
		top: 40
	}));
	
	note.add(C.ui.createLabel("notesmodal_label_instruction",{
		top: 40
	}));
	
	
	table.addEventListener("click",function(e){
		if (e.row && e.row.pagename){
			setNote({
				pagename: e.row.pagename,
				note: e.row.note,
				titlemain:e.row.titlemain,
				titlesup:e.row.titlesup,
				args: e.row.args,
				pageid: e.row.pageid
			});
		}
	});
	
	table.addEventListener("delete",function(e){
		C.content.deleteNote(e.row.pagename);
	});
	
	var closebtn = C.ui.createButton({
		k_type: "Button",
		top: 10,
		height: 30,
		left: 10,
		width: 30,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/close.png",
		//textid: "notesmodal_btn_close",
		k_click: close
	});
	panel.add(closebtn); 
	
	
	var editbtn = C.ui.createButton({
		top: 70,
		width: 100,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/edit.png",
		right: 10,
		textid: "notesmodal_btn_edit"
	});
	notelist.add(editbtn);
	editbtn.addEventListener("click",startEdit);
	
	var donebtn = C.ui.createButton({
		top: 70,
		width: 100,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/done.png",
		right: 10,
		visible: false,
		textid: "notesmodal_btn_done"
	});
	notelist.add(donebtn);
	donebtn.addEventListener("click",stopEdit);
	
	function startEdit(){
		donebtn.visible = true;
		editbtn.visible = false;
		table.editing = true;
	}
	
	function stopEdit(){
		donebtn.visible = false;
		editbtn.visible = true;
		table.editing = false;
	}
	
	
	pb.sub("/shownotesmodal",show);
	
	return view;
};