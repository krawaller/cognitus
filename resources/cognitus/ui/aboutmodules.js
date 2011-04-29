C.ui.createAboutModulesView = function(o){
	var view = C.ui.createPage({
		backgroundColor: "red"
	});
	var webview = C.ui.createWebView({top:30});
	view.add(webview);
	view.render = function(){
		C.ui.updateWebView(webview,C.content.getText("aboutmodules_description"));
	};
	return view;
};