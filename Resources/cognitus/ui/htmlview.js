(function(){

var webviewmaster = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory+"/cognitus/html/master.html").read().text;
/*function updateWebView(w,html){
	w.html = webviewmaster.replace(/XXXCONTENTXXX/,html);
	/*Ti.API.log("webviewheight: "+w.evalJS("document.height;"));
	w.height = Math.max(w.evalJS("document.height;"),200)+50;
}*/

C.ui.createHtmlView = function(){
	var view = C.ui.createPage({
		visible: false
	});
	var webview =  Ti.UI.createWebView({
		scalesPageToFit:true,
	   // contentWidth:'auto',
	    contentHeight:'auto',
		top: 30
	});
	webview.addEventListener("load",function(e){
		var newheight = Math.max(webview.evalJS("document.height;"),200); // TODO - make this change!
		//Ti.API.log("UPDATED WEBVIEW!! LOADDDD! "+newheight);
		webview.height = newheight;
		view.contentHeight = newheight;
		view.contentHeight = "auto";
	});
	view.add(webview);

	view.render = function(argstouse,topage){
		//Ti.API.log(["Updating web view",argstouse,topage]);
		view.scrollTo(0,0);
		var id = (topage.using === "module" ? topage.pageid+"_"+argstouse.ModuleId :
				  topage.using === "skill" ? topage.pageid+"_"+argstouse.SkillId : 
				  topage.using === "news" ? "news_html_"+argstouse.NewsId : 
				  topage.pageid) + (topage.using === "news" ? "" : "_html");
		Ti.API.log(["webview",id]);
		//updateWebView(webview,C.content.getText(id));
		webview.html = webviewmaster.replace(/XXXCONTENTXXX/,C.content.getText(id));
	};
	return view;
}

})();