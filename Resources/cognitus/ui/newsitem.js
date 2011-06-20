C.ui.createNewsItemView = function(o){
	var view = C.ui.createPage({});
	var webview = C.ui.createWebView({top:30});
	view.add(webview);
	view.render = function(argstouse,topage){
		Ti.API.log(["WOWOWOW",C.content.getNewsItem(argstouse.NewsId)]);
		C.ui.updateWebView(webview,C.content.getText("news_html_"+argstouse.NewsId));
	};
	return view;
};