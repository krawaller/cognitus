C.ui.createHelpModal = function(){
	
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
			k_id: "panel"
		}]
	});
		
	function close(){
		view.visible = false;
	}
	
	
	function show(helptext){
		panel.left = 10;
		panel.right = 10;
		panel.bottom = 10;
		view.visible = true;
		webview.html = webviewmaster.replace(/XXXCONTENTXXX/,helptext);
	}
	
	var panel = view.k_children.panel;
	
	var closebtn = C.ui.createButton({
		k_type: "Button",
		top: 10,
		height: 30,
		left: 10,
		width: 30,
		image: Ti.Filesystem.resourcesDirectory+"/images/icons/close.png",
		//textid: "helpmodal_btn_close",
		k_click: close
	});

	panel.add(closebtn); 
	
	//try {
		Ti.API.log("LDSAÄDLSAPÄDLSA"); // row below crashes if not this line. WTF?!?!
		pb.sub("/showhelpmodal",show);
		//Ti.API.log("GUU!");
	//} catch(e) { Ti.API.log(["wtf",e]); }

	var webviewmaster = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory+"/cognitus/html/master.html").read().text;
	var webview = Ti.UI.createWebView({
		scalesPageToFit:true,
	   // contentWidth:'auto',
	    contentHeight:'auto',
		top: 50
	});
	webview.addEventListener("load",function(e){
		var newheight = Math.max(webview.evalJS("document.height;"),200); // TODO - make this change!
		//Ti.API.log("UPDATED WEBVIEW!! LOADDDD! "+newheight);
		webview.height = newheight;
		view.contentHeight = newheight;
		view.contentHeight = "auto";
	});
	panel.add(webview);


	return view;
};