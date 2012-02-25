(function(){

var webviewmaster = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory+"/cognitus/html/master.html").read().text;

Ti.include("/cognitus/ui/skillpanelview.js", "/cognitus/ui/aboutpanelview.js");

C.ui.createHtmlView = function(){
	var view = C.ui.createPage({});
	var webview =  Ti.UI.createWebView({
	//	scalesPageToFit:true,
	    contentWidth:'auto',
	    contentHeight:'auto',
		enableZoomControls:false,
		showVerticalScrollIndicator: true,
		bottom: 0
	});
	view.add(webview);

	view.render = function(argstouse,topage){
		webview.top = (topage.using === "skill" || topage.pageid === "about") ? 45 : 0;
		if (topage.using === "skill"){
			var skillpanel = C.ui.createSkillPanelView();
			Ti.API.log("debug","CREATED skillpanelview!");
			view.add(skillpanel);
			Ti.API.log("debug","ADDED skillpanelview!");
			skillpanel.visible = true;
			Ti.API.log("debug","CHANGE visible setting skillpanelview!");
		}
		if (topage.pageid === "about"){
			Ti.API.log("debug","Gonna create aboutpanelview");
			var aboutpanel = C.ui.createAboutPanelView();
			view.add(aboutpanel);
			aboutpanel.visible = true;
		}
		var id = (topage.using === "module" ? topage.pageid+"_"+argstouse.ModuleId :
				  topage.using === "skill" ? topage.pageid+"_"+argstouse.SkillId : 
				  topage.using === "news" ? "news_html_"+argstouse.NewsId : 
				  topage.pageid) + (topage.using === "news" ? "" : "_html"),
			text = C.content.getText(id);
		text = text.replace(/\/images/g,'images');
		webview.html = webviewmaster.replace(/XXXCONTENTXXX/,text).replace(/_LANG/g,"_lang_"+C.state.lang);
	};
	return view;
};

})();