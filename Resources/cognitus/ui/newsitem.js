C.ui.createNewsItemView = function(o){
	var view = C.ui.createPage({});
	var webview = C.ui.createWebView({top:30});
	view.add(webview);
	view.render = function(argstouse,topage){
		C.ui.updateWebView(webview,C.content.getText(argstouse.NewsId+"_content"));
	};
	return view;
};