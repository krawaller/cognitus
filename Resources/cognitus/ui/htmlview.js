(function(){

var webviewmaster = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory+"/cognitus/html/master.html").read().text;
/*function updateWebView(w,html){
	w.html = webviewmaster.replace(/XXXCONTENTXXX/,html);
	Ti.API.log("webviewheight: "+w.evalJS("document.height;"));
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
		top: 1
	});
	webview.addEventListener("load",function(e){
		var newheight = Math.max(webview.evalJS("document.height;"),200); // TODO - make this change!
		//Ti.API.log("UPDATED WEBVIEW!! LOADDDD! "+newheight);
		webview.height = newheight;
		view.contentHeight = newheight;
		view.contentHeight = "auto";
	});
	view.add(webview);

	// ******************** Skill-related controls
	Ti.include("/cognitus/ui/skillpanelview.js");
	var skillpanel = C.ui.createSkillPanelView();
	view.add(skillpanel);

	// ******************** About-app page controls
	Ti.include("/cognitus/ui/aboutpanelview.js");
	var aboutpanel = C.ui.createAboutPanelView();
	view.add(aboutpanel);

	view.render = function(argstouse,topage){
		//Ti.API.log(["Updating web view",argstouse,topage]);
		webview.top = (topage.using === "skill" || topage.pageid === "about") ? 40 : 0;
		skillpanel.visible = topage.using === "skill";
		aboutpanel.visible = topage.pageid === "about";
		view.scrollTo(0,0);
		var id = (topage.using === "module" ? topage.pageid+"_"+argstouse.ModuleId :
				  topage.using === "skill" ? topage.pageid+"_"+argstouse.SkillId : 
				  topage.using === "news" ? "news_html_"+argstouse.NewsId : 
				  topage.pageid) + (topage.using === "news" ? "" : "_html");
		//Ti.API.log(["webview",id]);
		//updateWebView(webview,C.content.getText(id));
		webview.html = webviewmaster.replace(/XXXCONTENTXXX/,C.content.getText(id)).replace(/_LANG/g,"_lang_"+C.state.lang);
	};
	return view;
};

})();