(function(){

var webviewmaster = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory+"/cognitus/html/master.html").read().text;

C.ui.createHtmlView = function(){
	var view = C.ui.createPage({});
	var webview =  Ti.UI.createWebView({
	//	scalesPageToFit:true,
	    contentWidth:'auto',
	    contentHeight:'auto',
		showVerticalScrollIndicator: true,
		bottom: 0
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
		webview.top = (topage.using === "skill" || topage.pageid === "about") ? 40 : 0;
		skillpanel.visible = topage.using === "skill";
		aboutpanel.visible = topage.pageid === "about";
		var id = (topage.using === "module" ? topage.pageid+"_"+argstouse.ModuleId :
				  topage.using === "skill" ? topage.pageid+"_"+argstouse.SkillId : 
				  topage.using === "news" ? "news_html_"+argstouse.NewsId : 
				  topage.pageid) + (topage.using === "news" ? "" : "_html");
		webview.html = webviewmaster.replace(/XXXCONTENTXXX/,C.content.getText(id)).replace(/_LANG/g,"_lang_"+C.state.lang);
	};
	return view;
};

})();