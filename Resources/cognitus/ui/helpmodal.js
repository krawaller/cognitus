C.ui.createHelpModal = function(){
	
	var modal = C.ui.createModal({zIndex:1000}),
		panel = modal.panel;

	
	
	function show(helptext,fromanothermodal){
		if (!fromanothermodal){
			panel.top = 20;
			panel.left = 20;
			panel.right= 20;
		} else {
			panel.top = 40;
			panel.left = 10;
			panel.right = 10;
		}
		webview.html = webviewmaster.replace(/XXXCONTENTXXX/,helptext);
		modal.show();
	}
	
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
		modal.contentHeight = newheight;
		modal.contentHeight = "auto";
	});
	modal.panel.add(webview);


	return modal;
};